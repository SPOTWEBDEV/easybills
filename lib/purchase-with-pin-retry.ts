import { ApiError } from "@/lib/api-client";

type RequestPin = (errorMessage?: string) => Promise<string | null>;

/** Port of the mobile purchaseWithPinRetry. Runs `attempt(pin)`: if the server answers with
 * `requiresPin` (no PIN sent, or a wrong one), shows the PIN prompt and retries with what was entered.
 * Returns null if the person cancels the prompt, otherwise the successful result.
 * Any other error is rethrown for the caller to handle. */
export async function purchaseWithPinRetry<T>(
  attempt: (pin?: string) => Promise<T>,
  requestPin: RequestPin
): Promise<T | null> {
  let pin: string | undefined;
  let promptError: string | undefined;

  // Bounded loop: a wrong-PIN spammer still gets stopped eventually.
  for (let i = 0; i < 5; i++) {
    try {
      return await attempt(pin);
    } catch (err) {
      if (err instanceof ApiError && (err.payload as { requiresPin?: boolean } | null)?.requiresPin) {
        const entered = await requestPin(promptError);
        if (!entered) return null;
        pin = entered;
        promptError = err.status === 401 ? "Incorrect PIN. Try again." : undefined;
        continue;
      }
      throw err;
    }
  }
  return null;
}
