import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleRegistrationRequest } from "./dispatch.ts";

Deno.serve((req) => handleRegistrationRequest(req));
