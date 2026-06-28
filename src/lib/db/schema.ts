import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userStatusEnum = pgEnum("user_status", [
  "pending",
  "approved",
  "rejected",
  "active",
]);

export const userRoleEnum = pgEnum("user_role", ["buyer", "seller", "admin"]);

export const metalStateEnum = pgEnum("metal_state", [
  "colpa",
  "concentrado",
  "refinado",
  "dore",
  "otro",
]);

export const operationStatusEnum = pgEnum("operation_status", [
  "new",
  "contacted",
  "nda_sent",
  "negotiating",
  "closed",
  "cancelled",
]);

export const docTypeEnum = pgEnum("doc_type", [
  "nda",
  "loi",
  "sco",
  "analysis_cert",
  "identity",
  "other",
]);

export const docStatusEnum = pgEnum("doc_status", [
  "requested",
  "pending",
  "uploaded",
  "approved",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").unique().notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  role: userRoleEnum("role").notNull(),
  status: userStatusEnum("status").notNull().default("pending"),
  country: text("country"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sellerProfiles = pgTable("seller_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  metalType: text("metal_type").notNull(),
  metalState: metalStateEnum("metal_state").notNull(),
  purity: decimal("purity", { precision: 5, scale: 2 }),
  humidity: decimal("humidity", { precision: 5, scale: 2 }),
  quantityKg: decimal("quantity_kg", { precision: 12, scale: 2 }),
  originCountry: text("origin_country"),
  originRegion: text("origin_region"),
  hasAnalysis: boolean("has_analysis").default(false),
  analysisLab: text("analysis_lab"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const buyerProfiles = pgTable("buyer_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  metalsInterested: text("metals_interested").array(),
  minPurity: decimal("min_purity", { precision: 5, scale: 2 }),
  quantityNeededKg: decimal("quantity_needed_kg", { precision: 12, scale: 2 }),
  destinationCountry: text("destination_country"),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
});

export const operations = pgTable("operations", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => users.id),
  buyerId: uuid("buyer_id").references(() => users.id),
  status: operationStatusEnum("status").notNull().default("new"),
  metalType: text("metal_type").notNull(),
  quantityKg: decimal("quantity_kg", { precision: 12, scale: 2 }),
  brokerNotes: text("broker_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  operationId: uuid("operation_id").references(() => operations.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => users.id),
  docType: docTypeEnum("doc_type").notNull(),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  requestedByAdmin: boolean("requested_by_admin").default(false),
  requestMessage: text("request_message"),
  status: docStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const documentRequests = pgTable("document_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  operationId: uuid("operation_id").references(() => operations.id),
  docType: docTypeEnum("doc_type").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mapZones = pgTable("map_zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  latitude: decimal("latitude", { precision: 9, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 9, scale: 6 }).notNull(),
  activeOperations: integer("active_operations").default(0),
  visible: boolean("visible").default(true),
});

export const siteStats = pgTable("site_stats", {
  id: integer("id").primaryKey().default(1),
  totalVolumeTons: decimal("total_volume_tons", { precision: 12, scale: 2 }).default("0"),
  countriesCount: integer("countries_count").default(0),
  yearsExperience: integer("years_experience").default(0),
  operationsClosed: integer("operations_closed").default(0),
});

export const companyInfo = pgTable("company_info", {
  id: integer("id").primaryKey().default(1),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  emailContact: text("email_contact").notNull().default(""),
  rut: text("rut").default(""),
  googleMapsUrl: text("google_maps_url").default(""),
});
