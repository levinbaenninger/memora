import { os } from "@orpc/server";

import type { Context } from "../context";

export const base = os.$context<Context>();
