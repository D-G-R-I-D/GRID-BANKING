import { describe, expect, it } from "vitest";
import {
  identityComplete,
  isIdentityNumber,
  loanLimitFor,
  maskIdentity,
} from "./identity";
import { LOAN_MAX_MINOR, LOAN_MAX_VERIFIED_MINOR } from "./loan";

describe("identity numbers", () => {
  it("are exactly 11 digits", () => {
    expect(isIdentityNumber("22123456789")).toBe(true);
    for (const bad of ["", "2212345678", "221234567890", "2212345678a"]) {
      expect(isIdentityNumber(bad)).toBe(false);
    }
  });

  it("only ever show the last four", () => {
    expect(maskIdentity("6789")).toBe("•••••••6789");
  });
});

describe("loan limit", () => {
  it("is the standard limit until both BVN and NIN are added", () => {
    expect(loanLimitFor({ bvnLast4: null, ninLast4: null })).toBe(
      LOAN_MAX_MINOR,
    );
    expect(loanLimitFor({ bvnLast4: "1234", ninLast4: null })).toBe(
      LOAN_MAX_MINOR,
    );
  });

  it("rises once both are added", () => {
    const both = { bvnLast4: "1234", ninLast4: "5678" };
    expect(identityComplete(both)).toBe(true);
    expect(loanLimitFor(both)).toBe(LOAN_MAX_VERIFIED_MINOR);
  });
});
