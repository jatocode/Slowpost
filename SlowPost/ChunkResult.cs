using SlowPost;
public sealed class ChunkResult : IResult
{
    public ChunkResult() { }

    public async Task ExecuteAsync(HttpContext context)
    {
        context.Response.ContentType = "text/plain"; // Or "application/json"

        var body = await context.Request.ReadFromJsonAsync<SlowPokeRequest>();
        if (body is null)
        {
            return;
        }
        for (int i = 0; i < body.Quantity; i++)
        {
            await Task.Delay(1000);
            Console.WriteLine($"Iteration {i}");
            await context.Response.WriteAsync($"Iteration {i}");
        }
    }
}