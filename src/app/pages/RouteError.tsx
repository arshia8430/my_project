import { isRouteErrorResponse, Link, useLocation, useRouteError } from "react-router";
import { AlertCircle } from "lucide-react";

function getErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown routing error";
}

export default function RouteError() {
  const error = useRouteError();
  const location = useLocation();
  const isApiPath = location.pathname.startsWith("/api");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4 text-white">
      <div className="max-w-xl w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-2xl text-center">
        <AlertCircle className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-3">مسیر پیدا نشد</h1>
        <p className="text-blue-100 mb-4">{getErrorMessage(error)}</p>
        <p className="text-sm text-blue-200 mb-6 break-all">Path: {location.pathname}</p>

        {isApiPath && (
          <div className="rounded-xl border border-yellow-300/30 bg-yellow-300/10 p-4 text-left text-sm text-yellow-50 mb-6">
            <p className="font-semibold mb-2">این صفحه توسط فرانت‌اند نمایش داده شده است.</p>
            <p>
              اگر انتظار JSON از API داشتی، یعنی درخواست <code className="text-yellow-200">/api</code> به Python App/cPanel نرسیده و به React برگشته است. تنظیمات Application URL، startup file و .htaccess را چک کن.
            </p>
          </div>
        )}

        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-blue-950 hover:bg-cyan-400 transition"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
