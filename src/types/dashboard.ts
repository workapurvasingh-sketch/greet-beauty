// Define interfaces

export interface MasterAgent {
  id: string
  name: string
  slug: string
  model: string
  instructions?: string
  base_url: string
  api_key: string
  max_tokens?: number
  status: string
  accessibility: string
  suggestions_prompts?: any
  knowledgebase_ids?: string[] // JSON array of KB IDs
  mcp_server_ids?: string[]   // JSON array of MCP server IDs
  trigger_ids?: string[]       // JSON array of trigger IDs
}

export interface KnowledgeBase {
  id: string
  name: string
  slug: string
  description: string
  embedding_model: string
  status: string
}

export interface Document {
  id: string
  name: string
  knowledgebase_id: string
  file_path: string
}

export interface knowledgebaseResponse {
  knowledgebase: KnowledgeBase
  documents: Document[]
}

export interface MCPServerArg {
  id: string
  key: string
  value?: string
}

export interface MCPServerTools {
  id: string
  name: string
  location?: string
  transport: 'stdio' | 'streamable_http' | 'sse'
  base_url: string
  api_key?: string
  auth_method?: string
  description?: string
  status: 'active' | 'inactive'
  args: MCPServerArg[]
}

export interface Triggers {
  id: string
  name: string
  description?: string
  trigger_type: string
  parameters?: any
  status: string
}

export interface SuggestionPrompt {
  id: string
  master_agent_id: string
  prompt_title: string
  prompt: string
}
