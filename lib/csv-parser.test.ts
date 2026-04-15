import { describe, it, expect } from "vitest";
import { parseBuyerList } from "./csv-parser";

describe("parseBuyerList", () => {
  it("parses tab-separated paste from Google Sheet", () => {
    const input = `email\tfirstName\tlastName\ttier\tqty
adam@test.com\tAdam\tCerthis\tEarly Bird\t2
jane@x.com\tJane\tDoe\tStandard\t1`;
    const { rows, errors } = parseBuyerList(input);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ email: "adam@test.com", firstName: "Adam", lastName: "Certhis", tier: "Early Bird", qty: 2 });
    expect(rows[1].qty).toBe(1);
    expect(errors).toEqual([]);
  });

  it("parses comma-separated CSV", () => {
    const input = `email,firstName,lastName,tier,qty
a@b.c,John,Smith,VIP,3`;
    const { rows } = parseBuyerList(input);
    expect(rows[0].qty).toBe(3);
  });

  it("reports invalid emails with row index", () => {
    const input = `email,firstName,lastName,tier,qty
not-an-email,X,Y,Early,1`;
    const { errors } = parseBuyerList(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/email/i);
  });

  it("defaults qty to 1 if missing", () => {
    const input = `email,firstName,lastName,tier
a@b.c,X,Y,VIP`;
    const { rows } = parseBuyerList(input);
    expect(rows[0].qty).toBe(1);
  });

  it("trims whitespace", () => {
    const input = `email,firstName,lastName,tier,qty
  a@b.c  , X ,Y, Early ,2`;
    const { rows } = parseBuyerList(input);
    expect(rows[0].email).toBe("a@b.c");
    expect(rows[0].firstName).toBe("X");
    expect(rows[0].tier).toBe("Early");
  });
});
