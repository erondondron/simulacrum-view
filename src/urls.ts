const BACKEND_HOST = "localhost:8000"
const WEBSOCKET_PROTOCOL = "ws"
const REST_PROTOCOL = "http"

export const PROJECTS_URL = `${REST_PROTOCOL}://${BACKEND_HOST}/projects`
export const SCENE_CHANGES_WS = `${WEBSOCKET_PROTOCOL}://${BACKEND_HOST}/scene_changes`
export const SCENE_PARAMS_URL = `${REST_PROTOCOL}://${BACKEND_HOST}/scene_params`
