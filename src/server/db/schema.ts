// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("post_name_idx").on(t.name)],
);

export const projects = createTable(
  "project",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdBy: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("project_name_idx").on(t.name)],
);

export const projectMembers = createTable(
  "project_member",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    projectId: d.integer().notNull(),
    userId: d.varchar({ length: 256 }).notNull(),
    hasJoined: d.boolean().default(false),
    projectRole: d.varchar({ length: 256 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("project_member_projectId_userId_idx").on(t.projectId, t.userId),
  ],
);

export const invoiceElements = createTable(
  "invoice_element",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    projectId: d.integer().notNull(),
    name: d.varchar({ length: 256 }).notNull(),
    clientId: d.varchar({ length: 256 }).notNull(),
    isHourly: d.boolean().notNull(),
    price: d.numeric({ precision: 10, scale: 2 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("invoice_element_projectId_name_idx").on(t.projectId, t.name)],
);

export const invoices = createTable(
  "invoice",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    projectId: d.integer().notNull(),
    clientId: d.varchar({ length: 256 }).notNull(),
    total: d.numeric({ precision: 10, scale: 2 }).notNull(),
    invoiceStatus: d.varchar({ length: 256 }).notNull(),
    payedAmount: d.numeric({ precision: 10, scale: 2 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("invoice_projectId_clientId_idx").on(t.projectId, t.clientId)],
);

export const invoiceItems = createTable("invoice_item", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  invoiceId: d.integer().notNull(),
  invoiceElementsid: d.integer().notNull(),
  quantity: d.integer().notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

export const payments = createTable("payment", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  clientId: d.varchar({ length: 256 }).notNull(),
  amount: d.numeric({ precision: 10, scale: 2 }).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

export const paymentAllocations = createTable("payment_allocation", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  paymentId: d.integer().notNull(),
  invoiceId: d.integer(), // can be NULL if unallocated (sitting as credit)
  amount: d.numeric({ precision: 10, scale: 2 }).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

export const riskAssessments = createTable("risk_assessment", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  clientId: d.integer().notNull(),
  invoiceId: d.integer(),
  score: d.numeric({ precision: 5, scale: 2 }).notNull(),
  calculatedAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

export const clientInformation = createTable("client_information", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  clientId: d.integer().notNull(),
  name: d.varchar({ length: 256 }).notNull(),
  email: d.varchar({ length: 256 }).notNull(),
  clerkid: d.varchar({ length: 256 }).notNull(),
  phone: d.varchar({ length: 256 }),
  address: d.varchar({ length: 256 }),
  companyName: d.varchar({ length: 256 }),
  companyAddress: d.varchar({ length: 256 }),
  vatNumber: d.varchar({ length: 256 }),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

export const userInformation = createTable("user_information", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 256 }).notNull(),
  email: d.varchar({ length: 256 }).notNull(),
  clerkid: d.varchar({ length: 256 }).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));
