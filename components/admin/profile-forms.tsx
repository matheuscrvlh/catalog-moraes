"use client";

import { Field, Input } from "@/components/ui/field";
import { updateOwnAccess, updateOwnDetails } from "@/lib/admin/profile-actions";
import { ActionForm } from "./action-form";

export function OwnDetailsForm({ fullName, phone }: { fullName: string; phone: string | null }) {
  return (
    <ActionForm action={updateOwnDetails} submitLabel="Salvar dados">
      {(errors) => (
        <div className="grid gap-5 md:grid-cols-2">
          <Field tone="light" label="Nome" error={errors.fullName}>
            <Input tone="light" name="fullName" defaultValue={fullName} autoComplete="name" />
          </Field>
          <Field tone="light" label="Telefone" error={errors.phone}>
            <Input
              tone="light"
              name="phone"
              type="tel"
              defaultValue={phone ?? ""}
              autoComplete="tel"
              placeholder="(22) 99999-9999"
            />
          </Field>
        </div>
      )}
    </ActionForm>
  );
}

export function OwnAccessForm({ email }: { email: string }) {
  return (
    <ActionForm action={updateOwnAccess} submitLabel="Atualizar acesso">
      {(errors) => (
        <>
          <Field tone="light" label="E-mail de acesso" error={errors.email}>
            <Input tone="light" name="email" type="email" defaultValue={email} autoComplete="email" />
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field tone="light" label="Nova senha" error={errors.password} hint="Em branco, a senha é mantida.">
              <Input tone="light" name="password" type="password" autoComplete="new-password" />
            </Field>
            <Field tone="light" label="Confirmar nova senha" error={errors.confirm}>
              <Input tone="light" name="confirm" type="password" autoComplete="new-password" />
            </Field>
          </div>
          <Field
            tone="light"
            label="Senha atual"
            error={errors.current}
            hint="Necessária para confirmar qualquer alteração de acesso."
          >
            <Input tone="light" name="current" type="password" autoComplete="current-password" />
          </Field>
        </>
      )}
    </ActionForm>
  );
}
