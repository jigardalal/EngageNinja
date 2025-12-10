import { SetMetadata } from '@nestjs/common';
import { REQUIRED_FEATURE_KEY } from '../guards/feature.guard';

export const RequireFeature = (feature: string) => SetMetadata(REQUIRED_FEATURE_KEY, feature);
