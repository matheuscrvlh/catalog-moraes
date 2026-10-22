"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Building2, IdCard, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { AuthInput, AuthSubmit } from "@/components/auth/auth-fields";
import { FormMessage } from "@/components/ui/field";
import { signIn, signUp } from "@/lib/auth/actions";
import { BUSINESS_TYPES } from "@/lib/format";
import type { FormState } from "@/lib/forms";

const initial: FormState = {};
const iconClass = "size-4";

function useNext() {
  return useSearchParams().get("next") ?? "";
}

export function SignInForm() {
  const next = useNext();
  const linkError = useSearchParams().get("erro") === "link";
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormMessage message={linkError ? "O link expirou ou já foi usado. Entre com sua senha." : state.message} />
      <AuthInput
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@suaempresa.com.br"
        icon={<Mail className={iconClass} />}
        error={state.errors?.email}
      />
      <AuthInput
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Sua senha"
        icon={<LockKeyhole className={iconClass} />}
        error={state.errors?.password}
      />
      <AuthSubmit pending={pending}>Entrar</AuthSubmit>
      <p className="text-center text-sm text-stone">
        Ainda não compra com a Moraes?{" "}
        <Link
          href={`/cadastro${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-red hover:underline"
        >
          Cadastre sua empresa
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const next = useNext();
  const [state, action, pending] = useActionState(signUp, initial);
  const errors = state.errors ?? {};

  if (state.ok) return <FormMessage tone="success" message={state.message} />;

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormMessage message={state.message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthInput
          label="Nome da empresa"
          name="companyName"
          placeholder="Adega Exemplo"
          icon={<Building2 className={iconClass} />}
          error={errors.companyName}
        />
        <AuthInput
          label="CNPJ"
          name="taxId"
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          icon={<IdCard className={iconClass} />}
          error={errors.taxId}
        />
      </div>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-ink">Tipo de negócio</span>
        <select
          name="businessType"
          defaultValue=""
          className="h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink outline-none focus:border-red/60 focus:ring-4 focus:ring-red/10"
        >
          <option value="" disabled>
            Selecione
          </option>
          {Object.entries(BUSINESS_TYPES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.businessType && <span className="mt-1.5 block text-xs text-red-600">{errors.businessType}</span>}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthInput
          label="Responsável"
          name="fullName"
          autoComplete="name"
          placeholder="Seu nome"
          icon={<UserRound className={iconClass} />}
          error={errors.fullName}
        />
        <AuthInput
          label="WhatsApp"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(22) 99999-9999"
          icon={<Phone className={iconClass} />}
          error={errors.phone}
        />
      </div>
      <AuthInput
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@suaempresa.com.br"
        icon={<Mail className={iconClass} />}
        error={errors.email}
      />
      <AuthInput
        label="Senha"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo de 8 caracteres"
        icon={<LockKeyhole className={iconClass} />}
        error={errors.password}
      />
      <label className="flex items-start gap-2.5 text-[13px] text-stone">
        <input type="checkbox" required className="mt-0.5 size-4 accent-red" />
        Declaro que a empresa atua no comércio de bebidas e que sou maior de 18 anos.
      </label>
      <AuthSubmit pending={pending}>Criar conta da empresa</AuthSubmit>
      <p className="text-center text-sm text-stone">
        Já tem cadastro?{" "}
        <Link
          href={`/entrar${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-red hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
