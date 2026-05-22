import {
  BriefcaseBusiness,
  CircleUserRound,
  Gem,
  Home,
  Landmark,
  PiggyBank,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";

export const avatarOptions = [
  { value: "user", label: "Usuário", icon: UserRound },
  { value: "circle-user", label: "Perfil", icon: CircleUserRound },
  { value: "familia", label: "Família", icon: UsersRound },
  { value: "casa", label: "Casa", icon: Home },
  { value: "negocio", label: "Negócio", icon: BriefcaseBusiness },
  { value: "banco", label: "Banco", icon: Landmark },
  { value: "cofrinho", label: "Cofrinho", icon: PiggyBank },
  { value: "premium", label: "Premium", icon: Gem },
] satisfies Array<{ value: string; label: string; icon: LucideIcon }>;

const avatarColorByValue: Record<string, string> = {
  user: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "circle-user": "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  familia: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  casa: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  negocio: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  banco: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  cofrinho: "border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  premium: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
};

export function getAvatarOption(value?: string | null) {
  return avatarOptions.find((option) => option.value === value) ?? avatarOptions[0];
}

type AvatarProps = {
  value?: string | null;
  label?: string;
  className?: string;
};

export function Avatar({ value, label, className }: AvatarProps) {
  const option = getAvatarOption(value);
  const Icon = option.icon;

  return (
    <span
      aria-label={label ?? option.label}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-sm",
        avatarColorByValue[option.value],
        className,
      )}
      title={label ?? option.label}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

