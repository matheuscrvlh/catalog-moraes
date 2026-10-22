"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { createCustomer } from "@/lib/admin/sales-actions";
import { BUSINESS_TYPES } from "@/lib/format";
import { ActionForm } from "./action-form";
import { Sheet } from "./controls";

const defaultTrigger = (open: () => void) => (
  <Button variant="dark" onClick={open}>
    <Plus className="size-4" /> Novo cliente
  </Button>
);

export function CustomerSheet({ trigger = defaultTrigger }: { trigger?: (open: () => void) => ReactNode }) {
  return (
    <Sheet
      title="Novo cliente"
      description="Cadastre a empresa para montar pedidos em nome dela. Com senha, o cliente também acessa a loja."
      trigger={trigger}
    >
      {(close) => (
        <ActionForm action={createCustomer} onDone={close} submitLabel="Cadastrar cliente">
          {(errors) => (
            <>
              <Field tone="light" label="Nome da empresa" error={errors.companyName}>
                <Input tone="light" name="companyName" autoComplete="off" placeholder="Adega Exemplo" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field tone="light" label="CNPJ ou CPF" error={errors.taxId}>
                  <Input tone="light" name="taxId" inputMode="numeric" placeholder="00.000.000/0000-00" />
                </Field>
                <Field tone="light" label="Tipo de negócio" error={errors.businessType}>
                  <Select tone="light" name="businessType" defaultValue="">
                    <option value="" disabled>
                      Selecione
                    </option>
                    {Object.entries(BUSINESS_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field tone="light" label="Responsável" error={errors.fullName}>
                  <Input tone="light" name="fullName" autoComplete="off" />
                </Field>
                <Field tone="light" label="WhatsApp" error={errors.phone}>
                  <Input tone="light" name="phone" type="tel" placeholder="(22) 99999-9999" />
                </Field>
              </div>
              <Field tone="light" label="E-mail" error={errors.email}>
                <Input tone="light" name="email" type="email" autoComplete="off" />
              </Field>
              <Field
                tone="light"
                label="Senha de acesso (opcional)"
                error={errors.password}
                hint="Em branco, o cliente fica sem acesso à loja e os pedidos são montados pela equipe."
              >
                <Input tone="light" name="password" type="password" autoComplete="new-password" />
              </Field>
            </>
          )}
        </ActionForm>
      )}
    </Sheet>
  );
}
