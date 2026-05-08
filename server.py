import os
import json
import geopandas as gpd
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from app import AgentGraph
from thread_manager import ChatbotThreadManager

api = FastAPI(title="WandeRound API")
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_agent = AgentGraph()
_agent.model_choose("DEEPSEEK")
_threads = ChatbotThreadManager()


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def _run_agent(message: str):
    state = {
        "messages": [{"role": "user", "content": message}],
        "location": None,
        "geocode_data": None,
        "error": None,
    }
    geopandas_file: Optional[str] = None
    final_response = ""
    thinking_steps: list = []

    try:
        for chunk in _agent.graph.stream(state, stream_mode="updates"):
            for key, value in chunk.items():
                if "steps" in value:
                    steps = value.get("steps", [])
                    overpass_instr = value.get("overpassInstructions", [])
                    thinking_steps += steps + overpass_instr
                    yield _sse({"type": "thinking", "steps": steps, "overpass": overpass_instr})

                if "overpassResponses" in value:
                    queries = value.get("overpassResponses", [])
                    thinking_steps += queries
                    yield _sse({"type": "overpass", "queries": queries})

                if "stepCodes" in value:
                    codes = value.get("stepCodes")
                    code = codes[-1] if isinstance(codes, list) else codes
                    if hasattr(code, "content"):
                        code = code.content
                    code_str = str(code)
                    thinking_steps.append(code_str)
                    yield _sse({"type": "code", "content": code_str})

                if "geopandasData" in value:
                    geopandas_file = value.get("geopandasData")

                if "finalResponse" in value:
                    resp = value.get("finalResponse")
                    if hasattr(resp, "content"):
                        final_response = resp.content
                    elif isinstance(resp, list) and resp:
                        r = resp[-1]
                        final_response = r.content if hasattr(r, "content") else str(r)
                    else:
                        final_response = str(resp) if resp else ""
    except Exception as e:
        yield _sse({"type": "error", "content": str(e)})
        yield _sse({"type": "done", "content": f"Error: {e}", "thinking": thinking_steps, "file": None})
        return

    if geopandas_file:
        try:
            gdf = gpd.read_file(geopandas_file).to_crs(epsg=4326)
            geojson = json.loads(gdf.to_json())
            yield _sse({"type": "map", "geojson": geojson, "file": geopandas_file})
        except Exception as e:
            print(f"Map conversion error: {e}")

    yield _sse({"type": "response", "content": final_response})
    yield _sse({"type": "done", "content": final_response, "thinking": thinking_steps, "file": geopandas_file})


# ── Request models ────────────────────────────────────────────────────────────

class ChatReq(BaseModel):
    thread_id: str
    message: str

class CreateThreadReq(BaseModel):
    title: Optional[str] = None

class RenameThreadReq(BaseModel):
    title: str

class AddMessageReq(BaseModel):
    role: str
    content: str
    thinking_steps: Optional[list] = None
    geopandas_link: Optional[str] = None


# ── Routes ────────────────────────────────────────────────────────────────────

@api.post("/api/chat/stream")
def chat_stream(req: ChatReq):
    return StreamingResponse(
        _run_agent(req.message),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@api.get("/api/threads")
def list_threads():
    return _threads.get_thread_list()


@api.post("/api/threads")
def create_thread(req: CreateThreadReq):
    tid = _threads.create_thread(req.title)
    return {"id": tid}


@api.get("/api/threads/{thread_id}/messages")
def get_messages(thread_id: str):
    return _threads.get_thread_messages(thread_id)


@api.post("/api/threads/{thread_id}/messages")
def add_message(thread_id: str, req: AddMessageReq):
    _threads.add_message(thread_id, req.role, req.content, req.thinking_steps, req.geopandas_link)
    return {"ok": True}


@api.delete("/api/threads/{thread_id}")
def delete_thread(thread_id: str):
    _threads.delete_thread(thread_id)
    return {"ok": True}


@api.patch("/api/threads/{thread_id}")
def rename_thread(thread_id: str, req: RenameThreadReq):
    _threads.rename_thread(thread_id, req.title)
    return {"ok": True}


@api.get("/api/map")
def get_map(file: str):
    if not os.path.exists(file):
        raise HTTPException(status_code=404, detail="Map file not found")
    try:
        gdf = gpd.read_file(file).to_crs(epsg=4326)
        return json.loads(gdf.to_json())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(api, host="0.0.0.0", port=8000, reload=True)
