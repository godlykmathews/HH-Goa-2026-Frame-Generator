function cleanCredentialText(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

/** Creates a stable display-only credential number without storing personal data. */
export function createBuilderCredentialCode(name: string, role: string): string {
  const source = `${cleanCredentialText(name)}|${cleanCredentialText(role)}`.toLocaleUpperCase(
    "en-US",
  );
  let hash = 2166136261;

  for (const character of source) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }

  return `HH26-${(hash >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-6)}`;
}
