/** Fields every level of the API hierarchy shares. */
interface ApiBase {
  id: string;
  name: string;
  /** One figure per entry in `ClientsResponse.months`. */
  values: number[];
}

/** Shape of the payload served by `GET /api/clients`: company → branches → employees → channels. */
export type ApiChannel = ApiBase;

export interface ApiEmployee extends ApiBase {
  /** Absent for every employee except Anna Blackwood in the current data. */
  channels?: ApiChannel[];
}

export interface ApiBranch extends ApiBase {
  /** Absent for Branch 2 and Branch 3 in the current data. */
  employees?: ApiEmployee[];
}

export interface ApiCompany extends ApiBase {
  branches: ApiBranch[];
}

export interface ClientsResponse {
  /** ISO date (first of the month) for each index of every `values` array. */
  months: string[];
  company: ApiCompany;
}

export type NodeLevel = "company" | "branch" | "employee" | "channel";

/** UI-side node: the API's per-level child keys (branches/employees/channels) folded into `children`. */
export interface TreeNode {
  id: string;
  name: string;
  values: number[];
  level: NodeLevel;
  children: TreeNode[];
}

/** A node as it appears in the flattened, currently-visible list of rows. */
export interface FlatRow {
  node: TreeNode;
  /** 1-based depth, as expected by `aria-level`. */
  depth: number;
  parentId: string | null;
  posInSet: number;
  setSize: number;
  hasChildren: boolean;
  isExpanded: boolean;
}
