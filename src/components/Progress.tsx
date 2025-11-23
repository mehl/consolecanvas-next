import { progressRenderer } from "./progressRenderer";
import { InkCanvas } from "./InkCanvas";


export const Progress = ({ progress, ...restProps }: {
    progress: number;
    [key: string]: any;
}) => {
    return <InkCanvas width={18} height={9} {...restProps}>
        {(canvas) => {
            const progressrenderer = progressRenderer(canvas, {
                color: [60, 255, 100],
                inactiveColor: undefined,
                textColor: [255, 255, 255],
                thickness: 4,
            });
            progressrenderer.render({ progressPercent: progress });
        }}
    </InkCanvas>;
};