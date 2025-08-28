import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import { FiDownloadCloud } from "react-icons/fi"

interface ChartCardProps {
  title: string
  value?: string
  change?: string
  changeType?: "positive" | "negative"
  children: React.ReactNode
  className?: string
  contentClassName?: string
  hideActions?: boolean
  compactHeader?: boolean
  rightNode?: React.ReactNode
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  value,
  change,
  changeType = "positive",
  children,
  className = "",
  contentClassName = "",
  hideActions = false,
  compactHeader = false,
  rightNode,
}) => {
  return (
    <Card className={`p-3 bg-white border border-neutral-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${compactHeader ? "mb-1" : "mb-2"}`}>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
          {value && (
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-2xl font-bold text-neutral-900 leading-tight">{value}</p>
              {change && (
                <div
                  className={`flex items-center gap-1 ${changeType === "positive" ? "text-green-500" : "text-red-500"}`}
                >
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-sm font-medium">{change}</span>
                </div>
              )}
            </div>
          )}
        </div>
        {!hideActions && (
          <div className="flex items-center gap-2">
            {rightNode}
            {/* Commented out download icon */}
            {/* {!hideActions && (
              <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 27 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M13.5585 10.75C13.775 10.75 13.9826 10.671 14.1356 10.5303L17.4005 7.53033C17.7192 7.23744 17.7192 6.76256 17.4005 6.46967C17.0817 6.17678 16.5649 6.17678 16.2462 6.46967L14.3747 8.18934V2C14.3747 1.58579 14.0093 1.25 13.5585 1.25C13.1077 1.25 12.7423 1.58579 12.7423 2V8.18934L10.8708 6.46967C10.5521 6.17678 10.0353 6.17678 9.71654 6.46967C9.3978 6.76256 9.3978 7.23744 9.71654 7.53033L12.9814 10.5303C13.1344 10.671 13.342 10.75 13.5585 10.75Z"
                      fill="black"
                    />
                    <path
                      d="M4.26952 20.5355C5.86326 22 8.42834 22 13.5585 22C18.6887 22 21.2538 22 22.8475 20.5355C24.2305 19.2647 24.4134 17.3219 24.4375 13.75H21.002C19.9422 13.75 19.6651 13.766 19.4325 13.8644C19.1999 13.9627 19.0063 14.1456 18.3166 14.8849L17.5627 15.6933C17.0163 16.2803 16.5835 16.7453 15.9845 16.9984C15.3856 17.2515 14.7197 17.2509 13.879 17.2501H13.238C12.3973 17.2509 11.7314 17.2515 11.1325 16.9984C10.5335 16.7453 10.1007 16.2803 9.5543 15.6933L8.80041 14.8849C8.11072 14.1456 7.91714 13.9627 7.6845 13.8644C7.45187 13.766 7.17477 13.75 6.11501 13.75H2.67947C2.70366 17.3219 2.88655 19.2647 4.26952 20.5355Z"
                      fill="black"
                    />
                    <path
                      d="M24.4412 12C24.4412 7.28595 24.4412 4.92893 22.8475 3.46447C21.5305 2.25428 19.5501 2.04415 16.0071 2.00767V4.87812C16.8685 4.59899 17.8658 4.77595 18.5548 5.40901C19.511 6.28769 19.511 7.71231 18.5548 8.59099L15.2899 11.591C14.8307 12.0129 14.2079 12.25 13.5585 12.25C12.9091 12.25 12.2863 12.0129 11.8271 11.591L8.56226 8.59099C7.60601 7.71231 7.60601 6.28769 8.56226 5.40901C9.2512 4.77595 10.2485 4.59899 11.1099 4.87813V2.00767C7.56687 2.04415 5.58654 2.25428 4.26952 3.46447C2.67578 4.92893 2.67578 7.28595 2.67578 12L2.67579 12.25L6.26114 12.2499C7.10183 12.2491 7.76766 12.2485 8.36661 12.5016C8.96558 12.7547 9.39835 13.2197 9.9448 13.8067L10.6987 14.6151C11.3884 15.3544 11.582 15.5373 11.8146 15.6356C12.0472 15.734 12.3243 15.75 13.3841 15.75H13.7329C14.7927 15.75 15.0698 15.734 15.3024 15.6356C15.535 15.5373 15.7286 15.3544 16.4183 14.6151L17.1722 13.8067C17.7187 13.2197 18.1514 12.7547 18.7504 12.5016C19.3494 12.2485 20.0152 12.2491 20.8559 12.2499L24.4412 12.25L24.4412 12Z"
                      fill="black"
                    />
                  </svg>
                  <FiDownloadCloud />
                </Button>
              </div>
            )} */}
          </div>
        )}
      </div>

      {/* Chart/Content */}
      <div className={`w-full ${contentClassName || "h-20"}`}>{children}</div>
    </Card>
  )
}

export default ChartCard
