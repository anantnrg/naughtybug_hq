export interface SegmentorSettings {
  totalSegments?: number;
  filledSegments?: number;
  offset?: number;
}

export class Segmentor {
  private svg: SVGElement;
  private totalSegments: number;
  private filledSegments: number;
  private offset: number;

  constructor(svgId: string | SVGElement, settings: SegmentorSettings) {
    let el: SVGElement | null;

    if (typeof svgId === "string") {
      const found = document.getElementById(svgId);
      if (!(found instanceof SVGElement)) {
        throw new Error(`Element with id '${svgId}' is not an SVGElement`);
      }
      el = found;
    } else {
      el = svgId;
    }

    this.svg = el;
    if (!el) throw new Error(`SVG element not found for id: ${svgId}`);
    this.svg = el;
    this.totalSegments = settings.totalSegments ?? 10;
    this.filledSegments = settings.filledSegments ?? 0;
    this.offset = settings.offset ?? 0;
    this.draw();
  }

  /** Converts polar coordinates to cartesian. */
  static polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number,
  ): { x: number; y: number } {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  /** Creates an SVG path arc description for a segment. */
  static describeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
  ): string {
    const start = Segmentor.polarToCartesian(x, y, radius, endAngle);
    const end = Segmentor.polarToCartesian(x, y, radius, startAngle);
    const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      arcSweep,
      0,
      end.x,
      end.y,
    ].join(" ");
  }

  /** Draws all the segments into the SVG. */
  private draw(): void {
    let len =
      this.offset === 0
        ? 360 / this.totalSegments
        : (360 - this.offset * this.totalSegments) / this.totalSegments;

    let prevEndAngle = 0;
    let segmentHTML = "";

    if (this.offset === 0 && this.totalSegments === 1) {
      segmentHTML = `<circle cx="160" cy="160" r="130"${
        this.filledSegments === 1 ? ' class="filled"/>' : " />"
      }`;
    } else {
      for (let i = 1; i <= this.totalSegments; i++) {
        const prevStartAngle = prevEndAngle + this.offset;
        prevEndAngle = len * i + this.offset * i;
        segmentHTML += `<path ${
          this.filledSegments >= i ? 'class="filled" ' : ""
        }d="${Segmentor.describeArc(160, 160, 130, prevStartAngle, prevEndAngle)}"/>`;
      }
    }

    this.svg.innerHTML = segmentHTML;
  }

  /** Updates total/filled segments or offset dynamically. */
  update(totalSegments: number, filledSegments: number, offset: number): void {
    this.totalSegments = totalSegments;
    this.filledSegments = filledSegments;
    this.offset = offset;
    this.draw();
  }
}
