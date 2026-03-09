import { FC, ReactNode, HTMLAttributes, InputHTMLAttributes, ButtonHTMLAttributes } from 'react';

export const Button: FC<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string; loading?: boolean; rightIcon?: ReactNode }>;
export const Input: FC<InputHTMLAttributes<HTMLInputElement> & { label?: string; helperText?: string; error?: string; iconLeft?: ReactNode; iconRight?: ReactNode }>;
export const Card: FC<HTMLAttributes<HTMLDivElement>>;
export const Badge: FC<HTMLAttributes<HTMLSpanElement> & { variant?: string }>;
export const Modal: FC<{ isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; maxWidth?: string }>;
export const Spinner: FC<{ size?: string; color?: string; className?: string }>;
export const Avatar: FC<{ src?: string; fallback?: string; size?: string }>;
export const DALToaster: FC;
export const toast: any;
export function showToast(message: string, type?: 'success' | 'error' | 'default'): void;
