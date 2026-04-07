import { useState } from 'react';
import { Image, Group, Box, Modal } from '@mantine/core';
import type { VehicleImage } from '../../data/vehicles';

interface Props {
  images: VehicleImage[];
  name: string;
}

export function ImageGallery({ images, name }: Props) {
  const primaryIndex = images.findIndex((img) => img.isPrimary);
  const [selected, setSelected] = useState(primaryIndex !== -1 ? primaryIndex : 0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <Box>
        <Image
          src={images[selected].data ?? undefined}
          alt={name}
          radius="lg"
          h={400}
          fit="cover"
          fallbackSrc="https://placehold.co/800x400?text=AutoZaimi"
          style={{ cursor: 'pointer' }}
          onClick={() => setLightbox(true)}
          className="animate-fade-in"
        />
        <Group gap="sm" mt="sm">
          {images.map((img, i) => (
            <Image
              key={i}
              src={img.data ?? undefined}
              alt={img.name ?? `${name} ${i + 1}`}
              w={80}
              h={60}
              fit="cover"
              radius="md"
              style={{
                cursor: 'pointer',
                opacity: i === selected ? 1 : 0.5,
                border: i === selected ? '2px solid var(--mantine-color-teal-6)' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
              onClick={() => setSelected(i)}
            />
          ))}
        </Group>
      </Box>

      <Modal
        opened={lightbox}
        onClose={() => setLightbox(false)}
        size="xl"
        centered
        withCloseButton
        padding={0}
      >
        <Image
          src={images[selected].data ?? undefined}
          alt={images[selected].name ?? name}
          fit="contain"
          mah="80vh"
        />
      </Modal>
    </>
  );
}