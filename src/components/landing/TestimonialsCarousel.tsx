import { Container, Title, Text, Stack, Avatar, Rating, Paper, Box, Group, useMantineColorScheme } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconQuote } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { testimonials } from '../../data/testimonials';
import { AnimatedSection } from '../common/AnimatedSection';

export function TestimonialsCarousel() {
  const { t } = useTranslation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box py={80} style={{ position: 'relative' }}>
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'linear-gradient(180deg, transparent 0%, rgba(0,191,165,0.03) 50%, transparent 100%)'
            : '#ffffff',
          opacity: isDark ? 1 : undefined,
          pointerEvents: 'none',
        }}
      />
      <Container size="lg" style={{ position: 'relative' }}>
        <AnimatedSection scale>
          <Stack align="center" gap="sm" mb={40}>
            <div className="section-label">
              <IconQuote size={14} />
              {t('testimonials.title')}
            </div>
            <Title
              order={2}
              ta="center"
              fw={800}
              style={!isDark ? { color: '#1a1b1e' } : undefined}
            >
              {t('testimonials.title')}
            </Title>
            <Text
              ta="center"
              maw={500}
              c={isDark ? 'dimmed' : undefined}
              style={!isDark ? { color: '#868e96' } : undefined}
            >
              {t('testimonials.subtitle')}
            </Text>
          </Stack>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <Carousel
            slideSize={{ base: '100%', sm: '50%', md: '33.333%' }}
            slideGap="lg"
            withIndicators
          >
            {testimonials.map((item, idx) => (
              <Carousel.Slide key={item.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  style={{ height: '100%' }}
                >
                  <Paper
                    className="glass-card glass-card-hover quote-decoration"
                    p="xl"
                    radius="lg"
                    h="100%"
                    style={{
                      position: 'relative',
                      overflow: 'visible',
                      ...(!isDark && {
                        background: '#ffffff',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                      }),
                    }}
                  >
                    <Stack gap="md" justify="space-between" h="100%">
                      <Text
                        size="md"
                        fs="italic"
                        lineClamp={4}
                        style={{
                          lineHeight: 1.7,
                          ...(!isDark && { color: '#1a1b1e' }),
                        }}
                      >
                        &ldquo;{item.quote}&rdquo;
                      </Text>
                      <Stack gap="xs">
                        <Rating value={item.rating} readOnly size="sm" color="yellow" />
                        <Group gap="sm">
                          <Avatar
                            color="teal"
                            radius="xl"
                            size="md"
                            style={{ border: '2px solid var(--mantine-color-teal-6)' }}
                          >
                            {item.authorAvatar}
                          </Avatar>
                          <div>
                            <Text
                              size="sm"
                              fw={600}
                              style={!isDark ? { color: '#1a1b1e' } : undefined}
                            >
                              {item.authorName}
                            </Text>
                            <Text
                              size="xs"
                              c={isDark ? 'dimmed' : undefined}
                              style={!isDark ? { color: '#868e96' } : undefined}
                            >
                              {item.authorName}
                            </Text>
                          </div>
                        </Group>
                      </Stack>
                    </Stack>
                  </Paper>
                </motion.div>
              </Carousel.Slide>
            ))}
          </Carousel>
        </AnimatedSection>
      </Container>
    </Box>
  );
}
