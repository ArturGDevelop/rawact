import { RenderSymbol } from "../hooks";
import useEffect from "./useEffect";
import useRef from "./useRef";
import useMemo from "./useMemo";
import useState from "./useState";
import expandObject from "../expandObject";

function Component(props) {
	this.props = props;
}
Component[RenderSymbol] = function(props) {
	const instance = useMemo(() => {
		return new this(props);
	}, []);

	const [state, setState] = useState(instance.state);
	const [forceRenderGen, setForceRenderGen] = useState(0);

	instance.__setForceRenderGen = setForceRenderGen;
	instance.__forceRenderGen = forceRenderGen;

	const prevForceRenderGen = useRef(null);
	const prevProps = useRef(null);
	const prevState = useRef(null);
	const prevRenderResult = useRef(null);

	const doUpdate =
		prevForceRenderGen.current !== forceRenderGen ||
		!instance.shouldComponentUpdate ||
		instance.shouldComponentUpdate(props, state);

	instance.props = props;
	instance.state = state;
	instance.__setState = setState;

	if (!doUpdate) {
		prevForceRenderGen.current = forceRenderGen;
		prevProps.current = props;
		prevState.current = state;
		return context => context.a;
	}

	useEffect(() => {
		if (instance.componentDidMount) instance.componentDidMount();
		return () => {
			if (instance.componentWillUnmount) instance.componentWillUnmount();
		};
	}, []);

	useEffect(() => {
		if (prevProps.current) {
			if (instance.componentDidUpdate)
				instance.componentDidUpdate(prevProps.current, prevState.current);
		}
		prevForceRenderGen.current = forceRenderGen;
		prevProps.current = props;
		prevState.current = state;
	}, expandObject(props).concat(expandObject(state)));

	return (prevRenderResult.current = instance.render());
};

Component.prototype.setState = function(newState) {
	this.__setState(Object.assign({}, this.state, newState));
};

Component.prototype.forceUpdate = function() {
	this.__setForceRenderGen(this.__forceRenderGen + 1);
};

export { Component as default };
