import type { InferSelectModel } from "drizzle-orm";
import type {
  users,
  sellerProfiles,
  buyerProfiles,
  operations,
  documents,
  documentRequests,
  mapZones,
  siteStats,
  companyInfo,
} from "@/lib/db/schema";

export type User = InferSelectModel<typeof users>;
export type SellerProfile = InferSelectModel<typeof sellerProfiles>;
export type BuyerProfile = InferSelectModel<typeof buyerProfiles>;
export type Operation = InferSelectModel<typeof operations>;
export type Document = InferSelectModel<typeof documents>;
export type DocumentRequest = InferSelectModel<typeof documentRequests>;
export type MapZone = InferSelectModel<typeof mapZones>;
export type SiteStats = InferSelectModel<typeof siteStats>;
export type CompanyInfo = InferSelectModel<typeof companyInfo>;

// Composite types for joined queries
export type UserWithSellerProfile = User & {
  sellerProfile: SellerProfile | null;
};

export type UserWithBuyerProfile = User & {
  buyerProfile: BuyerProfile | null;
};

export type OperationWithParties = Operation & {
  seller: User | null;
  buyer: User | null;
  assignedAdmin: User | null;
};

export type OperationWithDocuments = Operation & {
  documents: Document[];
};

// Enum value types
export type UserStatus = User["status"];
export type UserRole = User["role"];
export type MetalState = SellerProfile["metalState"];
export type OperationStatus = Operation["status"];
export type DocType = Document["docType"];
export type DocStatus = Document["status"];
