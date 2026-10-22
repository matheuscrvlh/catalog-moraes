"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { AuthDivider, AuthInput, AuthSubmit } from "@/components/auth/auth-fields";
import { FormMessage } from "@/components/ui/field";
import { signInStaff } from "@/lib/auth/actions";
import type { FormState } from "@/lib/forms";

export function AdminLoginForm() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(signInStaff, {} as FormState);
  const denied = params.get("erro") === "sem-acesso";

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={params.get("next") ?? ""} />
      <AuthDivider>acesso restrito à equipe</AuthDivider>
      <FormMessage message={state.message ?? (denied ? "Este acesso não tem permissão para o painel." : undefined)} />
      <AuthInput
        glass
        label="E-mail"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="voce@moraes.com.br"
        icon={<Mail className="size-4" />}
        error={state.errors?.email}
      />
      <AuthInput
        glass
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Sua senha"
        icon={<LockKeyhole className="size-4" />}
        error={state.errors?.password}
      />
      <AuthSubmit pending={pending}>Entrar no painel</AuthSubmit>
      <p className="text-center text-[13px] text-stone">Esqueceu a senha? Peça a um administrador para redefinir.</p>
    </form>
  );
}
