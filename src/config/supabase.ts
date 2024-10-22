import { createClient } from "@supabase/supabase-js";
import { Database } from "types/supabase";

const datalake = createClient<Database>(
  process.env.DATALAKE_URL,
  process.env.DATALAKE_KEY,
);

export default datalake;
