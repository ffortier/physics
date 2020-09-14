// Import stylesheets
import './style.css';

const appDiv = document.getElementById('app');
const canvas = document.createElement('canvas');

canvas.width = document.body.offsetWidth * 2;
canvas.height = document.body.offsetHeight * 2;

appDiv.append(canvas);

class MetricMultiplier {
  constructor(
    readonly symbol: string,
    readonly base10: number,
  ) {}
}

const noMultiplier = new MetricMultiplier('', 0);
const deca = new MetricMultiplier('da', 1);
const hecto = new MetricMultiplier('h', 2);
const kilo = new MetricMultiplier('k', 3);
const mega = new MetricMultiplier('M', 6);
const giga = new MetricMultiplier('G', 9);
const tera = new MetricMultiplier('T', 12);
const deci = new MetricMultiplier('d', -1);
const centi = new MetricMultiplier('c', -2);
const milli = new MetricMultiplier('m', -3);
const micro = new MetricMultiplier('μ', -6);
const nano = new MetricMultiplier('n', -9);

function u (value: number, unit: 'm'): Distance;
function u (value: number, unit: 'dam'): Distance;
function u (value: number, unit: 'g'): Mass;
function u (value: number, unit: 'kg'): Mass;
function u (value: number, unit: string): unknown {
  switch (unit) {
    case 'g': return new Gram().withValue(value);
    case 'kg': return new Gram().withMultiplier(kilo).withValue(value);
    case 'm': return new Meter().withValue(value);
    case 'dam': return new Meter().withMultiplier(deca).withValue(value);
    default: throw new Error('unknown unit: ' + unit);
  }
};

abstract class Metric<T extends Metric<T>> {
  constructor(
    readonly multiplier: MetricMultiplier = noMultiplier,
  ) {}

  abstract withMultiplier(multiplier: MetricMultiplier): T;
}

class Distance {
  constructor(
    readonly value: number,
    readonly unit: Meter,
  ) {}

  toPixel(): number {
    return this.value * Math.pow(10, this.unit.multiplier.base10);
  }
}

class Mass {
  constructor(
    readonly value: number,
    readonly unit: Gram,
  ) {}
}

class Meter extends Metric<Meter> {
  withMultiplier(multiplier: MetricMultiplier): Meter {
    return new Meter(multiplier);
  }

  withValue(value: number): Distance {
    return new Distance(value, this);
  }
}

class Gram extends Metric<Gram> {
  withMultiplier(multiplier: MetricMultiplier): Gram {
    return new Gram(multiplier);
  }

  withValue(value: number): Mass {
    return new Mass(value, this);
  }
}

class Second {

}

interface PhysicalObject {
  draw(ctx: CanvasRenderingContext2D): void;
}

class CircularObject implements PhysicalObject {
  constructor(
    readonly radius: Distance,
    readonly x: Distance,
    readonly y: Distance,
    readonly color: string,
    readonly mass: Mass,
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x.toPixel(), this.y.toPixel(), this.radius.toPixel(), 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }
}

interface Force {
  combine(obj: PhysicalObject, otherForce: Force): Force;
  apply(obj: PhysicalObject): void;
}

function createObjects(): PhysicalObject[] {
  return [
    new CircularObject(u(20, 'm'), u(300, 'm'), u(100, 'dam'), 'crimson', u(10, 'kg')),
  ];
}

function createForces(): Force[] {
  return [];
}

const objects = createObjects();
const forces = createForces();
const ctx = canvas.getContext('2d');

let last = Date.now();

const animate = () => {
  const dt = Date.now() - last;
  last += dt;
  objects.forEach(obj => forces.reduce((force, combined) => force.combine(obj, combined)).apply(obj))
  objects.forEach(obj => obj.draw(ctx));
  requestAnimationFrame(animate);
};

animate();