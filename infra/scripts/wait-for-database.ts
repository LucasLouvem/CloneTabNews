import { exec } from "node:child_process";

function connectionReady() {
  exec(
    "docker exec postgres-dev pg_isready --host localhost",
    (error, stdout) => {
      if (!stdout.includes("accepting connections")) {
        process.stdout.write(".");
        connectionReady();
        return;
      }
      process.stdout.write("\n🟢 Postgres aceitando conexões\n\n");
    },
  );
}

process.stdout.write("\n🔴 Postgres ainda não aceita conexões!");
connectionReady();
