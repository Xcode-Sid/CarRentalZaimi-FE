import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Crown, ImagePlus } from "lucide-react";
import {
    Box, Stack, Text, Paper, Alert, SimpleGrid,
    Badge, ActionIcon, Center, useMantineColorScheme,
} from "@mantine/core";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CarImage {
    id: string;
    data: string | null;
    name: string | null;
    isPrimary: boolean;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CarImageUploadPanelProps {
    images: CarImage[];
    onImagesChange: (images: CarImage[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CarImageUploadPanel = ({ images, onImagesChange }: CarImageUploadPanelProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === "dark";

    const colors = {
        dropzoneBg: isDark ? "hsl(222 20% 10%)" : "hsl(0 0% 98%)",
        border: isDark ? "hsl(222 15% 22%)" : "hsl(220 13% 88%)",
        foreground: isDark ? "hsl(210 20% 96%)" : "hsl(222 47% 11%)",
        mutedFg: isDark ? "hsl(215 16% 55%)" : "hsl(215 16% 47%)",
        photoBorder: isDark ? "hsl(222 15% 22%)" : "hsl(220 13% 88%)",
    };

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const addFiles = useCallback(
        (files: FileList | null) => {
            if (!files) return;
            const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
            if (imageFiles.length === 0) return;

            Promise.all(
                imageFiles.map(
                    (file, index) =>
                        new Promise<CarImage>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () =>
                                resolve({
                                    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                                    data: (reader.result as string) ?? null,
                                    name: file.name,
                                    isPrimary: images.length === 0 && index === 0,
                                });
                            reader.readAsDataURL(file);
                        })
                )
            ).then((newImages) => {
                onImagesChange([...images, ...newImages]);
            });
        },
        [images, onImagesChange]
    );

    const removeImage = (id: string) => {
        const remaining = images.filter((img) => img.id !== id);
        if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
            remaining[0] = { ...remaining[0], isPrimary: true };
        }
        onImagesChange(remaining);
    };

    const setPrimary = (id: string) => {
        onImagesChange(images.map((img) => ({ ...img, isPrimary: img.id === id })));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <Stack gap="md">

            {/* ── Drop zone ─────────────────────────────────────────────────── */}
            <motion.div
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                style={{ cursor: "pointer" }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                <Paper
                    radius="lg"
                    p="xl"
                    withBorder
                    style={{
                        borderStyle: "dashed",
                        borderColor: dragging ? "var(--mantine-color-teal-5)" : colors.border,
                        background: dragging
                            ? "rgba(var(--mantine-color-teal-5-rgb), 0.08)"
                            : colors.dropzoneBg,
                        textAlign: "center",
                        transition: "all 0.2s",
                    }}
                >
                    <Center mb="sm">
                        <Box
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                background: "rgba(var(--mantine-color-teal-5-rgb), 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ImagePlus size={22} color="var(--mantine-color-teal-5)" />
                        </Box>
                    </Center>
                    <Text fw={500} size="sm" style={{ color: colors.foreground }}>
                        {dragging ? "Drop images here" : "Upload car images"}
                    </Text>
                    <Text size="xs" style={{ color: colors.mutedFg }} mt={4}>
                        Drag & drop or click to browse — multiple images supported
                    </Text>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => addFiles(e.target.files)}
                    />
                </Paper>
            </motion.div>

            {/* ── Image grid ────────────────────────────────────────────────── */}
            {images.length > 0 && (
                <Box>
                    <Text size="xs" style={{ color: colors.mutedFg }} mb="xs" ml={4}>
                        {images.length} image{images.length !== 1 ? "s" : ""} —{" "}
                        <Text span size="xs" c="teal.5" fw={500}>
                            tap crown to set primary
                        </Text>
                    </Text>
                    <SimpleGrid cols={3} spacing="xs">
                        <AnimatePresence>
                            {images.map((image) => (
                                <motion.div
                                    key={image.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.18 }}
                                    style={{
                                        position: "relative",
                                        aspectRatio: "16/9",
                                        borderRadius: 12,
                                        overflow: "hidden",
                                        border: `2px solid ${
                                            image.isPrimary
                                                ? "var(--mantine-color-teal-5)"
                                                : colors.photoBorder
                                        }`,
                                        transition: "border-color 0.2s",
                                    }}
                                    className="car-img-item"
                                >
                                    <img
                                        src={image.data ?? undefined}
                                        alt={image.name ?? "Car image"}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />

                                    {image.isPrimary && (
                                        <Badge
                                            size="xs"
                                            color="teal"
                                            style={{ position: "absolute", top: 6, left: 6 }}
                                            leftSection={<Crown size={9} />}
                                        >
                                            Primary
                                        </Badge>
                                    )}

                                    <Box
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background: "rgba(0,0,0,0.55)",
                                            opacity: 0,
                                            transition: "opacity 0.2s",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 8,
                                        }}
                                        className="car-img-overlay"
                                    >
                                        {!image.isPrimary && (
                                            <ActionIcon
                                                size="sm"
                                                color="teal"
                                                variant="filled"
                                                radius="md"
                                                title="Set as primary"
                                                onClick={(e) => { e.stopPropagation(); setPrimary(image.id); }}
                                            >
                                                <Crown size={13} />
                                            </ActionIcon>
                                        )}
                                        <ActionIcon
                                            size="sm"
                                            color="red"
                                            variant="filled"
                                            radius="md"
                                            title="Remove"
                                            onClick={(e) => { e.stopPropagation(); removeImage(image.id); }}
                                        >
                                            <X size={13} />
                                        </ActionIcon>
                                    </Box>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </SimpleGrid>
                </Box>
            )}

            {/* ── Info alert ────────────────────────────────────────────────── */}
            <Alert
                icon={<Upload size={14} />}
                color="teal"
                variant="light"
                radius="md"
                styles={{ message: { fontSize: "0.75rem", color: colors.mutedFg } }}
            >
                Upload multiple car images. The primary image is shown as the main photo in listings.
            </Alert>

            <style>{`
                .car-img-item:hover .car-img-overlay { opacity: 1 !important; }
            `}</style>
        </Stack>
    );
};