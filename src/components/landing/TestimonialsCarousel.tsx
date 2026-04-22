import { useEffect, useState } from 'react';
import { Container, Title, Text, Stack, Avatar, Rating, Paper, Box, Group, useMantineColorScheme } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconQuote } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../common/AnimatedSection';
import { PAGE_SIZE } from '../../constants/pagination';
import { get } from '../../utils/api.utils';

type CarReview = {
  id: string;
  createdOn: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    image: {
      imageName: string;
      imageData: string;
    } | null;
  };
};

const styles = `
  .tc-section {
    padding: 48px 0;
  }
  @media (min-width: 768px) {
    .tc-section {
      padding: 80px 0;
    }
  }

  .tc-title {
    font-size: 1.5rem !important;
  }
  @media (min-width: 768px) {
    .tc-title {
      font-size: 2rem !important;
    }
  }

  .tc-header {
    margin-bottom: 24px;
  }
  @media (min-width: 768px) {
    .tc-header {
      margin-bottom: 40px;
    }
  }

  /* Give carousel controls enough room on mobile */
  .tc-carousel .mantine-Carousel-controls {
    padding: 0 4px;
  }

  /* Indicators sit closer on mobile */
  .tc-carousel .mantine-Carousel-indicators {
    bottom: -24px;
  }

  /* Card padding tightens on mobile */
  .tc-card {
    padding: 16px !important;
  }
  @media (min-width: 640px) {
    .tc-card {
      padding: 24px !important;
    }
  }

  /* Comment text slightly smaller on mobile */
  .tc-comment {
    font-size: 0.875rem !important;
  }
  @media (min-width: 640px) {
    .tc-comment {
      font-size: 1rem !important;
    }
  }
`;

export function TestimonialsCarousel() {
  const { t } = useTranslation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [reviews, setReviews] = useState<CarReview[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await get(`CarReview/getAllPaged?pageNr=1&pageSize=${PAGE_SIZE}`);
        const items: CarReview[] = res.data.items ?? res.data;
        setReviews(items);
      } catch {
        // silently fail — testimonials section just stays empty
      }
    };
    fetchReviews();
  }, []);

  if (reviews.length === 0) return null;

  return (
    <>
      <style>{styles}</style>
      <Box className="tc-section" style={{ position: 'relative' }}>
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
        <Container size="lg" px="md" style={{ position: 'relative' }}>
          <AnimatedSection scale>
            <Stack align="center" gap="sm" className="tc-header">
              <div className="section-label">
                <IconQuote size={14} />
                {t('testimonials.title')}
              </div>
              <Title
                order={2}
                ta="center"
                fw={800}
                className="tc-title"
                style={!isDark ? { color: '#1a1b1e' } : undefined}
              >
                {t('testimonials.title')}
              </Title>
              <Text
                ta="center"
                maw={500}
                size="sm"
                c={isDark ? 'dimmed' : undefined}
                style={!isDark ? { color: '#868e96' } : undefined}
              >
                {t('testimonials.subtitle')}
              </Text>
            </Stack>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <Carousel
              classNames={{ root: 'tc-carousel' }}
              slideSize={{ base: '90%', sm: '50%', md: '33.333%' }}
              slideGap={{ base: 'sm', sm: 'lg' }}
              withIndicators
              pb={40}
            >
              {reviews.map((review, idx) => {
                const initials = `${review.user.firstName?.[0] ?? ''}${review.user.lastName?.[0] ?? ''}`;
                const fullName = `${review.user.firstName} ${review.user.lastName}`;

                return (
                  <Carousel.Slide key={review.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      style={{ height: '100%' }}
                    >
                      <Paper
                        className="glass-card glass-card-hover quote-decoration tc-card"
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
                            className="tc-comment"
                            fs="italic"
                            lineClamp={4}
                            style={{
                              lineHeight: 1.7,
                              ...(!isDark && { color: '#1a1b1e' }),
                            }}
                          >
                            &ldquo;{review.comment}&rdquo;
                          </Text>
                          <Stack gap="xs">
                            <Rating value={review.rating} readOnly size="sm" color="yellow" />
                            <Group gap="sm" wrap="nowrap">
                              <Avatar
                                color="teal"
                                radius="xl"
                                size="md"
                                src={review.user.image?.imageData ?? undefined}
                                style={{ border: '2px solid var(--mantine-color-teal-6)', flexShrink: 0 }}
                              >
                                {!review.user.image?.imageData && initials}
                              </Avatar>
                              <div style={{ minWidth: 0 }}>
                                <Text
                                  size="sm"
                                  fw={600}
                                  style={{
                                    wordBreak: 'break-word',
                                    ...(!isDark ? { color: '#1a1b1e' } : undefined),
                                  }}
                                >
                                  {fullName}
                                </Text>
                                <Text
                                  size="xs"
                                  c={isDark ? 'dimmed' : undefined}
                                  style={!isDark ? { color: '#868e96' } : undefined}
                                >
                                  {new Date(review.createdOn).toLocaleDateString()}
                                </Text>
                              </div>
                            </Group>
                          </Stack>
                        </Stack>
                      </Paper>
                    </motion.div>
                  </Carousel.Slide>
                );
              })}
            </Carousel>
          </AnimatedSection>
        </Container>
      </Box>
    </>
  );
}