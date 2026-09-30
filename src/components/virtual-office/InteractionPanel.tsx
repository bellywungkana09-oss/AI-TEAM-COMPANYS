import { motion } from "framer-motion";
import type { OfficeEmployee } from "@/types/office";
import { statusLabel } from "@/types/office";

export function InteractionPanel({
  employee,
  alexander,
  nearCeo,
  onClose,
  onCommand,
}: {
  employee: OfficeEmployee | null;
  alexander: OfficeEmployee | null;
  nearCeo: boolean;
  onClose: () => void;
  onCommand: () => void;
}) {
  const showCeo = nearCeo || employee?.id === "alexander";
  if (!employee && !showCeo) return null;
  const ceo = employee?.id === "alexander" ? employee : alexander;
  const person = employee;

  return (
    <motion.aside
      className="office-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {showCeo && (
        <div className="office-panel-block">
          <p className="office-kicker">Executive</p>
          <h2>CEO Alexander</h2>
          <p className="office-status-line">
            Status <strong>{statusLabel(ceo?.status ?? "idle")}</strong>
          </p>
          <button type="button" className="office-primary" onClick={onCommand}>
            Send Command
          </button>
        </div>
      )}
      {person && (
        <div className="office-panel-block">
          <div className="office-panel-head">
            <p className="office-kicker">{person.department}</p>
            <button type="button" className="office-text" onClick={onClose}>
              Close
            </button>
          </div>
          <h2>{person.name}</h2>
          <dl className="office-facts">
            <div>
              <dt>Role</dt>
              <dd>{person.role}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{person.department}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{statusLabel(person.status)}</dd>
            </div>
            <div>
              <dt>Current task</dt>
              <dd>{person.current_task ?? "None"}</dd>
            </div>
          </dl>
          <p className="office-kicker">Skills</p>
          <ul className="office-skills">
            {person.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.aside>
  );
}
