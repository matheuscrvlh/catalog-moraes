"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PERMISSIONS, PERMISSION_KEYS } from "@/lib/auth/permissions";
import { inviteMember, saveRole, saveSettings, updateMember } from "@/lib/admin/team-actions";
import { cn } from "@/lib/cn";
import { ActionForm } from "./action-form";
import { Sheet, Switch } from "./controls";
import { useToast } from "./toaster";

type RoleOption = { id: string; name: string };

export function InviteMemberSheet({ roles }: { roles: RoleOption[] }) {
  return (
    <Sheet
      title="Adicionar membro"
      description="Se o e-mail já tiver conta na loja, ele só recebe o cargo. Caso contrário, criamos o acesso com a senha inicial."
      trigger={(open) => (
        <Button variant="dark" onClick={open}>
          <Plus className="size-4" /> Adicionar membro
        </Button>
      )}
    >
      {(close) => (
        <ActionForm action={inviteMember} onDone={close} submitLabel="Adicionar">
          {(errors) => (
            <>
              <Field tone="light" label="Nome" error={errors.fullName}>
                <Input tone="light" name="fullName" autoComplete="off" />
              </Field>
              <Field tone="light" label="E-mail" error={errors.email}>
                <Input tone="light" name="email" type="email" autoComplete="off" />
              </Field>
              <Field
                tone="light"
                label="Senha inicial"
                error={errors.password}
                hint="Compartilhe com o membro e peça para trocar depois."
              >
                <Input tone="light" name="password" type="password" autoComplete="new-password" />
              </Field>
              <Field tone="light" label="Cargo" error={errors.roleId}>
                <Select tone="light" name="roleId" defaultValue={roles[0]?.id}>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </>
          )}
        </ActionForm>
      )}
    </Sheet>
  );
}

export function MemberControls({
  memberId,
  roleId,
  active,
  roles,
  isSelf,
}: {
  memberId: string;
  roleId: string;
  active: boolean;
  roles: RoleOption[];
  isSelf: boolean;
}) {
  const notify = useToast();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({ roleId, active });

  const apply = (next: { roleId: string | null; active: boolean }, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    const previous = state;
    if (next.roleId) setState({ roleId: next.roleId, active: next.active });
    startTransition(async () => {
      const result = await updateMember(memberId, next.roleId, next.active);
      if (!result.ok) setState(previous);
      notify(result.message ?? "", result.ok ? "success" : "error");
    });
  };

  if (isSelf) return <span className="text-xs text-ink/40">Você</span>;

  return (
    <span className={cn("flex items-center justify-end gap-3", pending && "opacity-60")}>
      <select
        aria-label="Cargo"
        value={state.roleId}
        disabled={pending}
        onChange={(event) => apply({ roleId: event.target.value, active: state.active })}
        className="h-9 rounded-xl border border-ink/10 bg-white px-3 text-[13px] outline-none focus:border-royal"
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
      <Switch
        checked={state.active}
        disabled={pending}
        label="Acesso ativo"
        onChange={(value) => apply({ roleId: state.roleId, active: value })}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          apply({ roleId: null, active: true }, "Remover o acesso ao painel? A conta continua existindo como cliente.")
        }
        className="rounded-xl p-2 text-ink/40 transition hover:bg-red/10 hover:text-red"
        aria-label="Remover acesso ao painel"
      >
        <UserMinus className="size-4" />
      </button>
    </span>
  );
}

type RoleRecord = { id: string; name: string; description: string | null; permissions: string[]; is_system: boolean };

export function RoleSheet({ role }: { role?: RoleRecord }) {
  const locked = Boolean(role?.is_system);
  const [selected, setSelected] = useState<string[]>(role?.permissions ?? ["dashboard.view"]);
  const full = selected.includes("*");

  const toggle = (key: string) =>
    setSelected((current) => (current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key]));

  return (
    <Sheet
      title={role ? "Editar cargo" : "Novo cargo"}
      description={
        locked ? "Cargo do sistema: as permissões são fixas." : "Defina o que esse cargo pode ver e fazer no painel."
      }
      trigger={(open) =>
        role ? (
          <button
            type="button"
            onClick={open}
            className="rounded-xl p-2 text-ink/45 hover:bg-cloud hover:text-ink"
            aria-label={`Editar ${role.name}`}
          >
            <Pencil className="size-4" />
          </button>
        ) : (
          <Button variant="dark" onClick={open}>
            <Plus className="size-4" /> Novo cargo
          </Button>
        )
      }
    >
      {(close) => (
        <ActionForm action={saveRole} onDone={close}>
          {(errors) => (
            <>
              <input type="hidden" name="id" value={role?.id ?? ""} />
              {selected.map((permission) => (
                <input key={permission} type="hidden" name="permissions" value={permission} />
              ))}
              <Field tone="light" label="Nome" error={errors.name}>
                <Input tone="light" name="name" defaultValue={role?.name} maxLength={60} />
              </Field>
              <Field tone="light" label="Descrição" error={errors.description}>
                <Textarea
                  tone="light"
                  name="description"
                  defaultValue={role?.description ?? ""}
                  maxLength={200}
                  className="min-h-20"
                />
              </Field>
              <fieldset disabled={locked}>
                <legend className="mb-3 text-[13px] font-medium text-ink/70">Permissões</legend>
                <ul className="divide-y divide-ink/6 rounded-2xl border border-ink/8">
                  <li className="flex items-center justify-between gap-4 p-4">
                    <span>
                      <span className="block text-sm font-medium">Acesso total</span>
                      <span className="text-xs text-ink/50">Tudo liberado, inclusive equipe e cargos.</span>
                    </span>
                    <Switch checked={full} onChange={() => toggle("*")} label="Acesso total" disabled={locked} />
                  </li>
                  {PERMISSION_KEYS.map((key) => (
                    <li key={key} className={cn("flex items-center justify-between gap-4 p-4", full && "opacity-40")}>
                      <span>
                        <span className="block text-sm font-medium">{PERMISSIONS[key].label}</span>
                        <span className="text-xs text-ink/50">{PERMISSIONS[key].description}</span>
                      </span>
                      <Switch
                        checked={full || selected.includes(key)}
                        onChange={() => toggle(key)}
                        label={PERMISSIONS[key].label}
                        disabled={locked || full}
                      />
                    </li>
                  ))}
                </ul>
                {errors.permissions && <p className="mt-2 text-xs text-red">{errors.permissions}</p>}
              </fieldset>
            </>
          )}
        </ActionForm>
      )}
    </Sheet>
  );
}

type Settings = {
  store_name: string;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  address: string | null;
  about: string | null;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  return (
    <ActionForm action={saveSettings} submitLabel="Salvar contato" className="space-y-5">
      {(errors) => (
        <>
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
            <Field tone="light" label="Nome da loja" error={errors.storeName}>
              <Input tone="light" name="storeName" defaultValue={settings.store_name} />
            </Field>
            <Field tone="light" label="E-mail" error={errors.email}>
              <Input tone="light" name="email" type="email" defaultValue={settings.email ?? ""} />
            </Field>
            <Field
              tone="light"
              label="WhatsApp de atendimento"
              error={errors.whatsapp}
              hint="DDI + DDD + número. Usado nos botões de contato do site."
            >
              <Input
                tone="light"
                name="whatsapp"
                inputMode="numeric"
                defaultValue={settings.whatsapp ?? ""}
                placeholder="5522992358186"
              />
            </Field>
            <Field tone="light" label="Telefone" error={errors.phone}>
              <Input tone="light" name="phone" defaultValue={settings.phone ?? ""} placeholder="(22) 2779-4940" />
            </Field>
            <Field tone="light" label="Instagram" error={errors.instagram} hint="Só o usuário, sem @.">
              <Input
                tone="light"
                name="instagram"
                defaultValue={settings.instagram ?? ""}
                placeholder="moraescomercialoficial"
              />
            </Field>
            <Field tone="light" label="Endereço" error={errors.address}>
              <Input tone="light" name="address" defaultValue={settings.address ?? ""} />
            </Field>
          </div>
          <Field tone="light" label="Sobre a loja" error={errors.about} hint="Aparece no rodapé do site.">
            <Textarea tone="light" name="about" defaultValue={settings.about ?? ""} maxLength={400} rows={4} />
          </Field>
        </>
      )}
    </ActionForm>
  );
}
