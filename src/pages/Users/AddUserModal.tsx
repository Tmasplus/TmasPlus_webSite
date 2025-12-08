import React, { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FloatingInput, FloatingSelect, Checkbox } from "@/components/ui/FloatingField";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";

type UserType = "cliente" | "conductor" | "empresa";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void; // ajusta al tipo real
};

const USER_TABS = [
  { value: "cliente", label: "Cliente" },
  { value: "conductor", label: "Conductor" },
  { value: "empresa", label: "Empresa" },
] as const;

type FieldKind = "input" | "select" | "checkbox";

type FieldDef = {
  id: keyof FormState;
  label: string;
  kind: FieldKind;
  colSpan?: 1 | 2;
  options?: { value: string; label: string }[]; // para selects
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"]; // para input
  // Control de visibilidad por tipo:
  showWhen?: (type: UserType, form: FormState) => boolean;
};

type FormState = {
  // comunes
  antecedentes: boolean;
  nombre: string;
  apellido: string;
  email: string;
  ciudad: string;
  tipoDocumento: string;
  nroDocumento: string;
  referralId: string;
  telefono: string;
  password: string;
  // conductor
  licencia: string;
  tipoVehiculo: string;
  placa: string;
  anioVehiculo: string;
  // empresa
  razonSocial: string;
  nit: string;
  nombreContacto: string;
};

const initialForm: FormState = {
  antecedentes: false,
  nombre: "",
  apellido: "",
  email: "",
  ciudad: "",
  tipoDocumento: "",
  nroDocumento: "",
  referralId: "",
  telefono: "",
  password: "",
  licencia: "",
  tipoVehiculo: "",
  placa: "",
  anioVehiculo: "",
  razonSocial: "",
  nit: "",
  nombreContacto: "",
};

// Config declarativa de campos
const FIELD_DEFS: FieldDef[] = [
  // -------- Toggle antecedentes (cliente y conductor)
  {
    id: "antecedentes",
    label: "Usar verificación de antecedentes",
    kind: "checkbox",
    colSpan: 2,
    showWhen: (t) => t === "cliente" || t === "conductor",
  },

  // -------- Comunes
  { id: "nombre", label: "Nombre", kind: "input" },
  { id: "apellido", label: "Apellido", kind: "input" },
  { id: "email", label: "Email", kind: "input", type: "email" },
  {
    id: "ciudad",
    label: "Ciudad",
    kind: "select",
    options: [
      { value: "CCS", label: "Caracas" },
      { value: "MAR", label: "Maracaibo" },
      { value: "VAL", label: "Valencia" },
    ],
  },
  {
    id: "tipoDocumento",
    label: "Tipo de Documento",
    kind: "select",
    options: [
      { value: "dni", label: "DNI" },
      { value: "pasaporte", label: "Pasaporte" },
      { value: "licencia", label: "Licencia" },
      { value: "nit", label: "NIT / RIF" },
    ],
  },
  { id: "nroDocumento", label: "Número de Documento", kind: "input" },
  { id: "referralId", label: "Referral ID", kind: "input" },
  { id: "telefono", label: "Teléfono", kind: "input" },

  // -------- Conductor
  {
    id: "licencia",
    label: "N° Daviplata",
    kind: "input",
    showWhen: (t) => t === "conductor",
  },
  {
    id: "tipoVehiculo",
    label: "Tipo de Vehículo",
    kind: "select",
    options: [
      { value: "auto", label: "Automóvil" },
      { value: "moto", label: "Motocicleta" },
      { value: "van", label: "Van" },
    ],
    showWhen: (t) => t === "conductor",
  },
  {
    id: "placa",
    label: "Placa",
    kind: "input",
    showWhen: (t) => t === "conductor",
  },
  {
    id: "anioVehiculo",
    label: "Año de Vehículo",
    kind: "input",
    type: "number",
    showWhen: (t) => t === "conductor",
  },

  // -------- Empresa
  {
    id: "razonSocial",
    label: "Razón Social",
    kind: "input",
    colSpan: 2,
    showWhen: (t) => t === "empresa",
  },
  // {
  //   id: "nit",
  //   label: "NIT / RIF",
  //   kind: "input",
  //   showWhen: (t) => t === "empresa",
  // },
  {
    id: "nombreContacto",
    label: "Nombre del Contacto",
    kind: "input",
    showWhen: (t) => t === "empresa",
  },

  // -------- Seguridad
  { id: "password", label: "Contraseña", kind: "input", type: "password" },
];

export const AddUserModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [type, setType] = useState<UserType>("cliente");
  const [form, setForm] = useState<FormState>(initialForm);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ type, ...form });
  }

  // Filtrar los campos a mostrar según el tipo seleccionado
  const visibleFields = useMemo(
    () => FIELD_DEFS.filter((f) => (f.showWhen ? f.showWhen(type, form) : true)),
    [type, form]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Añadir Usuario"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit}>Guardar</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tipo de Usuario */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Tipo de Usuario</p>
          <Tabs tabs={USER_TABS as any} value={type} onChange={(v) => setType(v as UserType)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleFields.map((f) => {
            const col = f.colSpan === 2 ? "md:col-span-2" : undefined;

            if (f.kind === "checkbox") {
              return (
                <div key={f.id} className={col}>
                  <Checkbox
                    checked={Boolean(form[f.id])}
                    onChange={(e) => update(f.id, e.target.checked as any)}
                    label={f.label}
                  />
                </div>
              );
            }

            if (f.kind === "select") {
              return (
                <FloatingSelect
                  key={f.id}
                  id={String(f.id)}
                  label={f.label}
                  className={col}
                  value={(form[f.id] as string) ?? ""}
                  onChange={(e) => update(f.id, e.target.value as any)}
                >
                  {(f.options || []).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </FloatingSelect>
              );
            }

            // input
            return (
              <FloatingInput
                key={f.id}
                id={String(f.id)}
                label={f.label}
                type={f.type}
                className={col}
                value={(form[f.id] as string) ?? ""}
                onChange={(e) => update(f.id, e.target.value as any)}
              />
            );
          })}
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal;
