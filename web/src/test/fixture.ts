import type { ClientsResponse } from "../domain/types";

export const MONTHS = [
  "2024-02-01", "2024-03-01", "2024-04-01", "2024-05-01", "2024-06-01", "2024-07-01",
  "2024-08-01", "2024-09-01", "2024-10-01", "2024-11-01", "2024-12-01", "2025-01-01",
];

/** The assignment payload: Branch 2/3 have no employees; only Anna Blackwood has channels. */
export const fixture: ClientsResponse = {
  months: MONTHS,
  company: {
    id: "company",
    name: "Company",
    values: [250, 267, 284, 301, 317, 334, 350, 250, 250, 250, 250, 350],
    branches: [
      {
        id: "b1",
        name: "Branch 1",
        values: [147, 157, 166, 156, 188, 201, 214, 147, 147, 147, 147, 214],
        employees: [
          {
            id: "anna",
            name: "Anna Blackwood",
            values: [25, 26, 28, 31, 32, 34, 38, 27, 27, 27, 27, 38],
            channels: [
              { id: "c1", name: "Existing clients", values: [25, 25, 26, 28, 31, 32, 34, 25, 25, 25, 25, 34] },
              { id: "c2", name: "New organic", values: [0, 1, 1, 1, 0, 2, 2, 1, 1, 1, 1, 2] },
              { id: "c3", name: "New paid", values: [0, 0, 1, 1, 2, 1, 0, 2, 1, 1, 1, 2] },
            ],
          },
          { id: "james", name: "James Walker", values: [12, 13, 14, 14, 15, 15, 16, 12, 12, 12, 12, 17] },
          { id: "maria", name: "Maria Gutierrez", values: [36, 39, 41, 22, 46, 48, 51, 35, 35, 35, 35, 52] },
          { id: "robert", name: "Robert Chen", values: [42, 43, 46, 47, 51, 55, 58, 41, 41, 41, 41, 54] },
          { id: "sarah", name: "Sarah Smith", values: [32, 36, 37, 42, 44, 49, 53, 32, 32, 32, 32, 53] },
        ],
      },
      { id: "b2", name: "Branch 2", values: [76, 80, 84, 87, 90, 92, 94, 75, 75, 75, 75, 91] },
      { id: "b3", name: "Branch 3", values: [27, 30, 34, 36, 39, 41, 42, 28, 28, 28, 28, 45] },
    ],
  },
};
