import type { ComponentProps } from "react";
import appConfig from "@/config/config";

interface AIAssistantAvatarProps extends ComponentProps<"img"> {}

export default function AIAssistantAvatar({ className = "", ...props }: AIAssistantAvatarProps) {
  return (
    <img
      src={appConfig.assistantAvatar}
      alt={appConfig.appName}
      className={`size-8 ${className}`}
      {...props}
    />
  );
}