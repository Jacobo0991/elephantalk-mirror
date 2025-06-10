import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import appConfig from 'src/config/app.config';
import {
  ToxicityClassificationResponse,
  ToxicityClassificationResult,
  ToxicityClassificationTags,
} from '../models/prediction.model';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ToxicityDetectorService {
  private readonly logger = new Logger(ToxicityDetectorService.name);

  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
    private readonly httpService: HttpService,
  ) {}

  async getToxicityClassification(
    text: string,
  ): Promise<ToxicityClassificationResult> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<ToxicityClassificationResponse>(
          `${this.config.toxicity.url}/moderate`,
          {
            content: text,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message);
            throw new ServiceUnavailableException(
              'Toxicity service is unavailable.',
            );
          }),
        ),
    );

    return this.getToxicityResponse(data.results);
  }

  getToxicityResponse(
    response: ToxicityClassificationTags,
  ): ToxicityClassificationResult {
    const {
      toxicity,
      severe_toxicity,
      obscene,
      identity_attack,
      insult,
      threat,
      sexual_explicit,
    } = response;

    const tags = [];

    if (toxicity > this.config.toxicity.threshold) {
      tags.push('toxicity');
    }

    if (severe_toxicity > this.config.toxicity.threshold) {
      tags.push('severe_toxicity');
    }

    if (obscene > this.config.toxicity.threshold) {
      tags.push('obscene');
    }

    if (identity_attack > this.config.toxicity.threshold) {
      tags.push('identity_attack');
    }

    if (insult > this.config.toxicity.threshold) {
      tags.push('insult');
    }

    if (threat > this.config.toxicity.threshold) {
      tags.push('threat');
    }

    if (sexual_explicit > this.config.toxicity.threshold) {
      tags.push('sexual_explicit');
    }

    return {
      isToxic: tags.length > 0,
      tags,
    };
  }
}
