import { CircleAlert } from "lucide-react";
import { Button } from "../ui/button";
import { HTTPError } from "ky";

interface ErrorBodyComponentProps {
  error: Error | HTTPError,
  onRefreshClick: () => void,
  onBackClick?: () => void,
}

function ErrorBodyComponent({ error, onRefreshClick, onBackClick }: ErrorBodyComponentProps) {
  const errorText = (() => {
    if (error instanceof HTTPError) {
      return `(${error.response.status})`;
    }
    else {
      return error.message
    }
  })();

  return (
    <div className="flex flex-col gap-4 pt-18 items-center">
      <CircleAlert size={`64px`} strokeWidth={2.5} />
      <div>
        <h2 className="text-base font-black text-center">Oops! Something went wrong</h2>
        <p className="text-sm font-normal text-center">Refresh the page and try again. {errorText}</p>
      </div>
      <div className="flex flex-row gap-2">
        {onBackClick && <Button onClick={onBackClick} variant="secondary">Back</Button>}
        <Button onClick={onRefreshClick}>Refresh</Button>
      </div>
    </div>
  );
};

export default ErrorBodyComponent;