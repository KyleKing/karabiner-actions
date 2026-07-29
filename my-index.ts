import { writeToProfile } from "karabiner.ts";
import { parameters, rules } from "./config.ts";

writeToProfile("Default profile", rules, parameters);
