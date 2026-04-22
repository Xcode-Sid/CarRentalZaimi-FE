export const inputStyles = {
    input: {
        transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s, transform 0.18s',
        '&:focus': {
            transform: 'translateY(-1px)',
            boxShadow: '0 0 0 3px rgba(29, 158, 117, 0.12)',
        },
    },
    label: {
        transition: 'color 0.15s',
        '&:has(+ * :focus)': { color: 'var(--mantine-color-teal-7)' },
    },
};

export const glassInputStyles = {
    input: {
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid var(--mantine-color-default-border)',
        '&:focus': { borderColor: 'var(--az-teal)' },
    },
};

export const adsInputStyles = {
    input: {
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid var(--mantine-color-default-border)',
    },
    wrapper: {
        '--input-bd-focus': 'var(--az-teal)',
    },
} as const;
