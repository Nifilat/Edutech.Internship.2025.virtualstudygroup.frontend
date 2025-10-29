import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      richColors
      expand
      closeButton
      position="top-right"
      toastOptions={{
        duration: 3500,
        classNames: {
          toast:
            "rounded-lg shadow-lg border border-gray-200 text-[14px] px-4 py-3",
          title: "text-[15px] font-semibold",
          description: "text-[12px] text-gray-600",
          actionButton:
            "bg-orange-normal hover:bg-orange-normal-hover text-white px-3 py-1 rounded-md",
          cancelButton: "text-gray-600",
        },
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      }}
      {...props}
    />
  );
}

export { Toaster }
