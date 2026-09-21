using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;

namespace MealWiseLauncher
{
    class Program
    {
        static HttpListener listener;
        static string baseDirectory;
        static int port = 5173;

        static void Main(string[] args)
        {
            baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            Console.Title = "MealWise Portable Desktop - Hôm Nay Ăn Gì?";
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("===============================================================================");
            Console.WriteLine("                    MEALWISE - PHIÊN BẢN MÁY TÍNH PORTABLE                     ");
            Console.WriteLine("            (Chạy ngay trên mọi máy tính - Không cần cài đặt Node.js)           ");
            Console.WriteLine("===============================================================================");
            Console.ResetColor();

            // Find free port between 5173 and 5250
            for (int p = 5173; p <= 5250; p++)
            {
                try
                {
                    listener = new HttpListener();
                    listener.Prefixes.Add("http://localhost:" + p + "/");
                    listener.Prefixes.Add("http://127.0.0.1:" + p + "/");
                    listener.Start();
                    port = p;
                    break;
                }
                catch
                {
                    if (listener != null)
                    {
                        try { listener.Close(); } catch {}
                    }
                }
            }

            if (listener == null || !listener.IsListening)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("[LỖI] Không thể mở cổng mạng nội bộ (5173-5250).");
                Console.ResetColor();
                Console.WriteLine("Bấm phím bất kỳ để thoát.");
                Console.ReadLine();
                return;
            }

            string appUrl = "http://localhost:" + port + "/";
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("[*] Web Server nội bộ đang hoạt động tại: " + appUrl);
            Console.WriteLine("[*] Đang tự động mở trình duyệt web của bạn...");
            Console.ResetColor();

            // Start listener thread
            Thread serverThread = new Thread(ListenLoop);
            serverThread.IsBackground = true;
            serverThread.Start();

            // Open browser
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = appUrl,
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("[!] Không thể tự bật trình duyệt: " + ex.Message);
                Console.WriteLine("[!] Bạn hãy mở Chrome/Edge và gõ: " + appUrl);
            }

            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("===============================================================================");
            Console.WriteLine("  LƯU Ý: Giữ nguyên cửa sổ đen này trong khi sử dụng ứng dụng MealWise.");
            Console.WriteLine("  Khi dùng xong, bạn chỉ cần đóng cửa sổ này lại là xong!");
            Console.WriteLine("===============================================================================");
            Console.ResetColor();
            Console.WriteLine();
            Console.WriteLine("Nhấn [Enter] bất cứ lúc nào để tắt ứng dụng...");
            Console.ReadLine();

            try { listener.Stop(); } catch {}
        }

        static void ListenLoop()
        {
            while (listener != null && listener.IsListening)
            {
                try
                {
                    var ctx = listener.GetContext();
                    ThreadPool.QueueUserWorkItem((state) => HandleRequest(ctx));
                }
                catch
                {
                    break;
                }
            }
        }

        static void HandleRequest(HttpListenerContext ctx)
        {
            try
            {
                string rawUrl = ctx.Request.Url.AbsolutePath;
                if (rawUrl == "/" || string.IsNullOrEmpty(rawUrl)) rawUrl = "/index.html";
                string relativePath = rawUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                string filePath = Path.Combine(baseDirectory, relativePath);

                if (!File.Exists(filePath))
                {
                    // SPA fallback to index.html for client side routing
                    filePath = Path.Combine(baseDirectory, "index.html");
                }

                if (File.Exists(filePath))
                {
                    string ext = Path.GetExtension(filePath).ToLowerInvariant();
                    string mime = "application/octet-stream";
                    switch (ext)
                    {
                        case ".html": mime = "text/html; charset=utf-8"; break;
                        case ".js":
                        case ".mjs": mime = "application/javascript; charset=utf-8"; break;
                        case ".css": mime = "text/css; charset=utf-8"; break;
                        case ".json": mime = "application/json; charset=utf-8"; break;
                        case ".webmanifest": mime = "application/manifest+json; charset=utf-8"; break;
                        case ".svg": mime = "image/svg+xml"; break;
                        case ".png": mime = "image/png"; break;
                        case ".jpg":
                        case ".jpeg": mime = "image/jpeg"; break;
                        case ".ico": mime = "image/x-icon"; break;
                        case ".woff": mime = "font/woff"; break;
                        case ".woff2": mime = "font/woff2"; break;
                        case ".apk": mime = "application/vnd.android.package-archive"; break;
                    }

                    ctx.Response.ContentType = mime;
                    ctx.Response.AddHeader("Access-Control-Allow-Origin", "*");
                    byte[] data = File.ReadAllBytes(filePath);
                    ctx.Response.ContentLength64 = data.Length;
                    ctx.Response.OutputStream.Write(data, 0, data.Length);
                }
                else
                {
                    ctx.Response.StatusCode = 404;
                }
            }
            catch {}
            finally
            {
                try { ctx.Response.OutputStream.Close(); } catch {}
            }
        }
    }
}
