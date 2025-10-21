import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export function AlertTemplate({icon, title, description}) {
  return (
    <div className="grid w-full max-w-xl items-start gap-4">
      <Alert>
        {icon}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {description}
        </AlertDescription>
      </Alert>
    </div>
  )
}
