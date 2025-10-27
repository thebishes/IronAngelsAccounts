import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PostgresConfig {
  hostname: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const config: PostgresConfig = {
  hostname: "132.226.215.254",
  port: 5432,
  user: "postgres",
  password: "6ccQll56TmCaSwefKBduVQyIuYmBoTEkrMh6sfQkWnaYVy4omHP4WfyBzAJt1Qu8",
  database: "postgres",
};

async function executeQuery(sql: string, params?: any[]) {
  const client = new Client(config);
  try {
    await client.connect();
    const result = await client.queryObject(sql, params);
    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    await client.end();
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { action, sql, params } = await req.json();

    if (action === "query") {
      const result = await executeQuery(sql, params);
      return new Response(
        JSON.stringify({ success: true, data: result.rows }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "test") {
      const result = await executeQuery("SELECT NOW() as current_time, version() as version");
      return new Response(
        JSON.stringify({ success: true, connection: "ok", data: result.rows }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});