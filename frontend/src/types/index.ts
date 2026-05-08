export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  thinking_steps?: string[];
  geopandas_link?: string;
  geojson?: GeoJSONData;
}

export interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface GeoJSONData {
  type: string;
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: unknown;
    };
    properties: Record<string, unknown>;
  }>;
}

export interface SSEEvent {
  type: "thinking" | "overpass" | "code" | "map" | "response" | "delta" | "done" | "error";
  content?: string;
  steps?: string[];
  overpass?: string[];
  queries?: string[];
  geojson?: GeoJSONData;
  file?: string;
  thinking?: string[];
}
