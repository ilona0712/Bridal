import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { router } from "./routes"
import { Root } from "./routes"
import { ThemeProvider } from "./contexts/ThemeContext"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Root>
        <RouterProvider router={router} />
      </Root>
    </ThemeProvider>
  </StrictMode>,
)