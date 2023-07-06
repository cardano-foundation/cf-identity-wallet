import type { RectReturn } from '@wdio/protocols/build/types';

import { IonicComponent } from './component';
import { Ionic$ } from '..';
import { Gestures } from '../..';

export class IonicSlides extends IonicComponent {
  rects: RectReturn | null = null;

  constructor(selector: string) {
    super(selector);
  }

  /**
   * Swipe the Swiper to the LEFT (from right to left)
   */
  async swipeLeft() {
    // Determine the rectangles of the Swiper
    const SwiperRectangles = await this.getSwiperRectangles();
    // We need to determine the center position of the Swiper on the screen. This can be done by taking the
    // starting position (SwiperRectangles.y) and add half of the height of the Swiper to it.
    const y = Math.round(SwiperRectangles.y + SwiperRectangles.height / 2);

    // Execute the gesture by providing a starting position and an end position
    return Gestures.swipe(
      // Here we start on the right of the Swiper. To make sure that we don't touch the outer most right
      // part of the screen we take 10% of the x-position. The y-position has already been determined.
      {
        x: Math.round(SwiperRectangles.width - SwiperRectangles.width * 0.1),
        y,
      },
      // Here we end on the left of the Swiper. To make sure that we don't touch the outer most left
      // part of the screen we add 10% to the x-position. The y-position has already been determined.
      { x: Math.round(SwiperRectangles.x + SwiperRectangles.width * 0.1), y }
    );
  }

  /**
   * Swipe the Swiper to the RIGHT (from left to right)
   */
  async swipeRight() {
    // Determine the rectangles of the Swiper
    const SwiperRectangles = await this.getSwiperRectangles();
    // We need to determine the center position of the Swiper on the screen. This can be done by taking the
    // starting position (SwiperRectangles.y) and add half of the height of the Swiper to it.
    const y = Math.round(SwiperRectangles.y + SwiperRectangles.height / 2);

    // Execute the gesture by providing a starting position and an end position
    return Gestures.swipe(
      // Here we start on the left of the Swiper. To make sure that we don't touch the outer most left
      // part of the screen we add 10% to the x-position. The y-position has already been determined.
      { x: Math.round(SwiperRectangles.x + SwiperRectangles.width * 0.1), y },
      // Here we end on the right of the Swiper. To make sure that we don't touch the outer most right
      // part of the screen we take 10% of the x-position. The y-position has already been determined.
      {
        x: Math.round(SwiperRectangles.width - SwiperRectangles.width * 0.1),
        y,
      }
    );
  }

  /**
   * Get the Swiper position and size
   */
  async getSwiperRectangles(): Promise<RectReturn> {
    const slides2 = await Ionic$.$(this.selector as string);
    // Get the rectangles of the Swiper and store it in a global that will be used for a next call.
    // We dont want ask for the rectangles of the Swiper if we already know them.
    // This will save unneeded webdriver calls.
    this.rects = this.rects || (await driver.getElementRect(slides2.elementId));

    return this.rects;
  }
}
