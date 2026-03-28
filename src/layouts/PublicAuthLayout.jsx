import Background from "../components/Background"
import Auth from "../pages/Auth/Auth.jsx"

/** Public shell: auth UI only (no app nav). */
export default function PublicAuthLayout() {
  return (
    <div id="root">
      <Background />
      <Auth />
    </div>
  )
}
