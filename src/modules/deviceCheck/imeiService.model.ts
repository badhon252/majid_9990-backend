import { Schema, model } from 'mongoose';

export interface IImeiServiceCatalog {
      category: string;
      name: string;
      normalizedName: string;
      price: string;
      currency: string;
      isFree: boolean;
      serviceId: number | null;
      serviceIds: number[];
      sourceNames: string[];
}

const imeiServiceCatalogSchema = new Schema<IImeiServiceCatalog>(
      {
            category: {
                  type: String,
                  required: true,
                  trim: true,
            },
            name: {
                  type: String,
                  required: true,
                  trim: true,
            },
            normalizedName: {
                  type: String,
                  required: true,
                  trim: true,
                  unique: true,
            },
            price: {
                  type: String,
                  required: true,
                  trim: true,
            },
            currency: {
                  type: String,
                  default: 'USD',
                  trim: true,
            },
            isFree: {
                  type: Boolean,
                  default: false,
            },
            serviceId: {
                  type: Number,
                  default: null,
            },
            serviceIds: {
                  type: [Number],
                  default: [],
            },
            sourceNames: {
                  type: [String],
                  default: [],
            },
      },
      {
            timestamps: true,
            versionKey: false,
      }
);

export const ImeiServiceCatalog = model<IImeiServiceCatalog>('ImeiServiceCatalog', imeiServiceCatalogSchema);
