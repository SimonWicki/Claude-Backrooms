import { Command } from "commander";
import { initWorkspace } from "./commands/init.js";
import { roomCreate, roomList, roomShow, roomSeal, roomFork } from "./commands/room.js";
import { enterRoom } from "./commands/enter.js";
import { exportGraph } from "./commands/graph.js";
import { validateRoom } from "./commands/validate.js";

const program = new Command();

program
  .name("claude-backrooms")
  .description("Room-scoped LLM containment + indexing CLI.")
  .version("0.1.0");

program.command("init").description("Initialize a local workspace in ./data").action(initWorkspace);

const room = program.command("room").description("Room operations");

room
  .command("create")
  .description("Create a new room")
  .requiredOption("--id <id>", "Room id, e.g. L3-ARCHIVE-17")
  .requiredOption("--ruleset <name>", "Ruleset name")
  .requiredOption("--memory <mode>", "Memory mode: ephemeral|persistent", "persistent")
  .requiredOption("--allowed <csv>", "Allowed output kinds as CSV")
  .option("--forbidden <csv>", "Forbidden classes as CSV", "")
  .option("--note <text>", "Human note")
  .action(roomCreate);

room.command("list").description("List rooms").action(roomList);
room.command("show").description("Show a room manifest + derived state").argument("<roomId>").action(roomShow);
room.command("seal").description("Seal a room (immutable)").argument("<roomId>").action(roomSeal);

room
  .command("fork")
  .description("Fork a room to a new adjacent room")
  .argument("<roomId>")
  .requiredOption("--new <newId>", "New room id")
  .option("--mutate <float>", "Mutation delta to apply", "0.05")
  .action(roomFork);

program
  .command("enter")
  .description("Enter a room and inject input")
  .argument("<roomId>")
  .requiredOption("--in <text>", "Input text")
  .option("--adapter <name>", "Adapter: mock|claude", "mock")
  .action(enterRoom);

program
  .command("graph")
  .description("Graph operations")
  .command("export")
  .description("Export room graph")
  .option("--format <fmt>", "json|mermaid", "json")
  .action(exportGraph);

program
  .command("validate")
  .description("Validate room manifest + derived state")
  .argument("<roomId>")
  .action(validateRoom);

program.parse(process.argv);
