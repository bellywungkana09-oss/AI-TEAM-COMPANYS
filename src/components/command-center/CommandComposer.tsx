import { useState } from "react";

export function CommandComposer({ onSubmit }: { onSubmit: (command: string) => Promise<void> }) {
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="command-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const command = value.trim();
        if (!command || pending) return;
        setPending(true);
        try {
          await onSubmit(command);
          setValue("");
        } finally {
          setPending(false);
        }
      }}
    >
      <label htmlFor="founder-command">Instruction for the company</label>
      <textarea
        id="founder-command"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buat website coffee shop"
        rows={3}
      />
      <button type="submit" className="office-primary" disabled={pending}>
        {pending ? "Sending" : "Execute command"}
      </button>
    </form>
  );
}
