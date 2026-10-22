"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select } from "@/components/ui/field";
import { updateProfile } from "@/lib/account/actions";
import { BUSINESS_TYPES, formatTaxId } from "@/lib/format";
import type { FormState } from "@/lib/forms";

type Props = {
  email: string;
  fullName: string;
  phone: string | null;
  companyName: string | null;
  taxId: string | null;
  businessType: string | null;
};

export function ProfileForm({ email, fullName, phone, companyName, taxId, businessType }: Props) {
  const [state, action, pending] = useActionState(updateProfile, {} as FormState);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="max-w-2xl space-y-8">
      <FormMessage message={state.message} tone={state.ok ? "success" : "error"} />
      <fieldset className="space-y-5">
        <legend className="caps mb-4 text-[15px] text-navy">Empresa</legend>
        <Field label="Nome da empresa" error={errors.companyName}>
          <Input name="companyName" defaultValue={companyName ?? ""} className="rounded-xs" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="CNPJ" error={errors.taxId}>
            <Input name="taxId" inputMode="numeric" defaultValue={formatTaxId(taxId) ?? ""} className="rounded-xs" />
          </Field>
          <Field label="Tipo de negócio" error={errors.businessType}>
            <Select name="businessType" defaultValue={businessType ?? ""} className="rounded-xs">
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
      </fieldset>
      <fieldset className="space-y-5">
        <legend className="caps mb-4 text-[15px] text-navy">Responsável</legend>
        <Field label="E-mail de acesso">
          <Input value={email} disabled readOnly className="rounded-xs" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nome" error={errors.fullName}>
            <Input name="fullName" defaultValue={fullName} autoComplete="name" className="rounded-xs" />
          </Field>
          <Field label="WhatsApp" error={errors.phone}>
            <Input name="phone" type="tel" defaultValue={phone ?? ""} autoComplete="tel" className="rounded-xs" />
          </Field>
        </div>
      </fieldset>
      <Button type="submit" pending={pending}>
        Salvar dados
      </Button>
    </form>
  );
}
